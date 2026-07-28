# EYWA — Consumo de recursos

> Medición real del 28-jul-2026 sobre el VPS de producción (`161.132.54.226`).
> **No son estimaciones**: al final está cómo reproducir cada número.
>
> Para qué sirve este documento: dimensionar la migración a nube sin adivinar, y
> tener cifras defendibles para el informe del fondo.

---

## Resumen en una frase

**EYWA consume 17,6 MiB de RAM y 0 % de CPU, y todos sus datos suman 12,5 MB.**
Cabe hoy en la instancia más pequeña que vende cualquier proveedor de nube.

---

## 1. Consumo en ejecución

Cinco muestras separadas por 3 segundos. **Las cinco dieron idéntico.**

| Recurso | Consumo | Contexto |
|---------|---------|----------|
| **CPU** | **0,00 %** | De 8 núcleos disponibles |
| **RAM** | **17,6 MiB** | 0,06 % de los 30 GB del VPS |
| **Procesos** | 19 PIDs | Node + Prisma |
| **Red** | 3,07 kB ↓ / 931 B ↑ | Acumulado en **56 minutos** |
| **Disco (I/O)** | 8,19 kB leídos · 0 escritos | Desde el último arranque |

**Lectura:** el backend está encendido esperando peticiones que no llegan. Esto mide
una plataforma **ociosa**, no su capacidad.

---

## 2. Consumo en disco

| Concepto | Peso | ¿Hay que preservarlo? |
|----------|------|----------------------|
| Base de datos `eywa_db` | **10 MB** | ✅ Sí — 31 tablas |
| Archivos subidos (dataroom, validador, logos, avatares) | **2,5 MB** | ✅ Sí — 24 archivos |
| **Subtotal: datos propios de EYWA** | **≈ 12,5 MB** | ✅ |
| Imagen Docker en uso | 673 MB | ❌ Se regenera en cada deploy |
| Repo en el VPS (código + `node_modules` + `.git`) | 294 MB | ❌ Sale de git |

> La distinción importa para la migración: hay que **mover 12,5 MB**, no 967 MB.
> Lo demás es andamiaje que se reconstruye solo.

### Tablas más grandes

| Tabla | Filas | Peso |
|-------|-------|------|
| `actors` | 320 | 320 kB |
| `funds` | 149 | 200 kB |
| `certificates` | 1 | 80 kB |
| `organizations` | 3 | 80 kB |
| `course_enrollments` | 2 | 72 kB |
| `diagnostic_options` | 53 | 72 kB |

Las dos tablas más pesadas son **catálogos precargados** (actores del ecosistema y
convocatorias), no datos generados por usuarios.

---

## 3. Lo que NO es de EYWA (evitar imputarlo mal)

Tres cosas que parecen consumo de EYWA y no lo son:

### 3.1 El Postgres es compartido con otras 9 bases
El contenedor `postgres_db` usa **134 MiB de RAM**, pero aloja:

| Base | Peso |
|------|------|
| **`eywa_db`** | **10 MB** |
| `odonto2026_db` | 8,1 MB |
| `espacioresiliente_db` | 8,0 MB |
| `lucyscan_db` | 8,0 MB |
| `genes_intranet_db` | 8,0 MB |
| `postulaciones_db` | 8,0 MB |
| `pascare_db` | 7,8 MB |
| `kotosh_db` | 7,8 MB |
| `beehive_db` | 7,7 MB |
| `main_db` | 7,5 MB |

⚠️ **Imputarle a EYWA los 134 MiB completos inflaría el costo.** EYWA es una de diez.

### 3.2 EYWA comparte el VPS con 34 contenedores ajenos
El servidor corre **35 contenedores** en total. Su carga, su disco y su riesgo no son
de EYWA. (También por eso **una prueba de estrés no debe correrse ahí**: saturarlo
afectaría servicios de terceros.)

### 3.3 Hay ~1,2 GB de imágenes huérfanas de EYWA
`eywa_api:latest` y `eywa_api_debug:latest` (597 MB cada una) **no las usa ningún
contenedor** — son restos de despliegues viejos. Se pueden borrar sin riesgo.

> Aparte, el VPS acumula **62 GB de caché de compilación** y 22 GB de imágenes
> recuperables (~40 GB liberables). **Eso no es de EYWA**, es del servidor entero.
> No se tocó: hacer `docker system prune` ahí afectaría a los otros 34 servicios.

---

## 4. Qué significa para dimensionar la nube

| Hecho medido | Consecuencia |
|--------------|--------------|
| 17,6 MiB de RAM | Sobra la instancia más pequeña de cualquier proveedor |
| 0 % de CPU sostenido | Un servicio que escala a cero (tipo Cloud Run) encaja bien |
| 10 MB de base | La instancia gestionada más chica sobra por órdenes de magnitud |
| 2,5 MB de archivos | El costo de almacenamiento es despreciable |
| 3 kB de red en 56 min | El costo de salida de datos es despreciable |

**Regla que se desprende:** empezar en el escalón más chico, medir, y crecer cuando la
medición lo pida. Dimensionar "por si acaso" con máquinas grandes quemaría dinero del
fondo sin un solo usuario que lo justifique.

⚠️ **Ojo con el cambio de modelo de cobro:** el VPS es una tarifa plana; la nube cobra
por uso. Un bucle, un bot o una prueba de estrés mal acotada pueden generar factura.
Configurar **presupuesto con alertas desde el día uno**.

---

## 5. Lo que esta medición NO responde

Ser explícito evita que se lea de más:

- ❌ **No dice qué carga aguanta.** Mide una plataforma ociosa. Para saber el techo hace
  falta una prueba de estrés (ver `PENDIENTES.md` §10.3).
- ❌ **No predice el consumo con usuarios reales.** Con 7 usuarios y 1 diagnóstico, no
  hay curva que extrapolar.
- ❌ **No incluye el frontend.** Vive en Vercel, con su propio plan y sus propias
  métricas; esto es solo el backend y la base de datos.
- ❌ **No incluye servicios externos:** Groq (validador IA) y Resend (correo) tienen
  cuota propia.

---

## 6. Cómo reproducir la medición

Para que este documento no envejezca en silencio:

```bash
ssh kaqui@161.132.54.226 'docker stats eywa_api --no-stream --format "CPU {{.CPUPerc}} | RAM {{.MemUsage}} | Red {{.NetIO}} | Disco {{.BlockIO}} | PIDs {{.PIDs}}"'
```

```bash
ssh kaqui@161.132.54.226 'docker exec postgres_db psql -U admin -d eywa_db -t -A -c "SELECT pg_size_pretty(pg_database_size(current_database()));"; du -sh /home/kaqui/eywa-uploads'
```

```bash
ssh kaqui@161.132.54.226 'docker exec postgres_db psql -U admin -d postgres -c "SELECT datname, pg_size_pretty(pg_database_size(datname)) FROM pg_database WHERE NOT datistemplate ORDER BY pg_database_size(datname) DESC;"'
```

---

## Ficha rápida

| | |
|---|---|
| **CPU** | 0,00 % |
| **RAM** | 17,6 MiB |
| **Datos a preservar** | 12,5 MB (10 MB base + 2,5 MB archivos) |
| **Usuarios registrados** | 7 (7 nunca ingresaron) |
| **Organizaciones** | 3 · **Diagnósticos**: 1 |
| **Medido** | 28-jul-2026 |
