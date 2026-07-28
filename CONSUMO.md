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

---

# Parte 2 — Consumo por usuario y cuellos de botella

> Medido el 28-jul-2026. Los pesos por fila salen de `pg_column_size` sobre datos
> reales; los tiempos, de 5 muestras por endpoint contra el backend desplegado.

## 7. Cuánto pesa un usuario en la base

Peso real de fila (sin contar índices ni overhead de página):

| Entidad | bytes/fila | Cuándo se crea |
|---------|-----------:|----------------|
| `diagnostic_results` | **1 848** | Cada vez que completa el diagnóstico (guarda el breakdown de 14 criterios) |
| `project_plans` | **1 312** | Por proyecto en el Validador (incluye el reporte de la IA) |
| `organizations` | **806** | Una por usuario que completa su perfil |
| `simbiocreaciones` | **593** | Por proyecto mapeado (incluye el grafo) |
| `exam_attempts` | **368** | Por intento de examen |
| `dataroom_documents` | **258** | Metadata; **el archivo va aparte, en disco** |
| `profiles` | **205** | Uno por usuario |
| `site_visits` | **135** | **Una por cada carga de página** ⚠️ |
| `certificates` | **101** | Por curso aprobado |
| `course_enrollments` | **91** | Por inscripción |
| `section_progress` | **80** | Por sección completada |

### Perfil de usuario típico (estimación con esos pesos)

| Tipo de usuario | Filas que genera | Datos en BD | Archivos |
|-----------------|------------------|------------:|---------:|
| **Curioso** (se registra, no vuelve) | perfil | **≈ 0,2 kB** | 0 |
| **Activo** (organización + diagnóstico + 1 curso) | perfil, organización, diagnóstico, inscripción, ~4 progresos, intento, certificado | **≈ 3,5 kB** | logo ~200 kB |
| **Completo** (+ dataroom + 2 proyectos validados) | lo anterior + 20 docs (metadata) + 2 planes | **≈ 11 kB** | **≈ 20 MB** |

> ⚠️ **El peso real no está en la base, está en los archivos.** Un usuario que llena
> su dataroom sube ~20 documentos; con el límite de 20 MB c/u eso puede llegar a
> **400 MB por empresa** en el peor caso. La base de datos es despreciable al lado.

### Proyección (el número que sirve para dimensionar)

| Usuarios | Datos en BD | Archivos (caso realista ~20 MB c/u) |
|---------:|------------:|------------------------------------:|
| 100 | ~1 MB | ~2 GB |
| 1 000 | ~11 MB | ~20 GB |
| 10 000 | ~110 MB | ~200 GB |

**Conclusión:** la base de datos **nunca** va a ser el problema de costo. El
almacenamiento de archivos sí — y crece lineal con las empresas que usen el dataroom.

---

## 8. ⚠️ La tabla que crece sin usuarios: `site_visits`

`site_visits` guarda **una fila (135 bytes) por cada carga de página**, incluidos
visitantes anónimos de la landing. No depende de cuántos usuarios registrados haya:

| Visitas/día | Filas/año | Peso/año |
|------------:|----------:|---------:|
| 100 | 36 500 | ~5 MB |
| 1 000 | 365 000 | ~50 MB |
| 10 000 | 3 650 000 | **~500 MB** |

Con tráfico serio, **esta tabla sola superará a todo lo demás junto**. Pendiente:
política de retención (p. ej. borrar el detalle a los 90 días y conservar solo
agregados diarios). Hoy no hay ninguna.

---

## 9. Cuellos de botella (medidos, ordenados por gravedad)

### 🔴 1. `bcryptjs` en el login — **447 ms por intento**

El cuello dominante, por lejos. Medido en el contenedor de producción:

```
verificar 1 contraseña: 447 ms  (min 404 / max 511)
=> techo teórico: ~2 logins/segundo por núcleo
```

**Por qué es tan lento:** el proyecto usa **`bcryptjs`**, la implementación en
JavaScript puro. La nativa (`bcrypt`) hace el mismo trabajo en el *thread pool* de
libuv, varias veces más rápido y **sin ocupar el hilo principal**. Con `bcryptjs`,
cada login compite con todas las demás peticiones.

**Impacto real:** una ráfaga de 20 logins simultáneos = ~9 segundos de CPU. Todo lo
demás (que responde en 6–34 ms) queda esperando detrás.

**Qué hacer:** cambiar a `bcrypt` nativo. El cost 12 está bien y **no hay que bajarlo**
— es lo que protege las contraseñas. El problema es la implementación, no el costo.

### 🔴 2. Las descargas cargan el archivo entero en RAM — y lo copian

```ts
data = await readFile(doc.storagePath);   // archivo completo en memoria
return c.body(new Uint8Array(data));      // …y una COPIA más
```

Con el límite de 20 MB del dataroom, **una descarga puede usar ~40 MB de RAM**.
Diez simultáneas: **~400 MB**. El contenedor hoy vive con 17,6 MiB.

Afecta a `dataroom.ts` (3 sitios), `validator.ts` y `media.ts`.

**Qué hacer:** servir con *stream* (`createReadStream`) en vez de `readFile`. Se
resuelve solo si se migra a almacenamiento en nube con URLs firmadas, porque entonces
el archivo ni pasa por el backend.

### 🟠 3. El análisis del Validador depende de Groq — ~2 s y con cuota

`POST /plans/:id/analyze` llama a una API externa. No es CPU propia, pero:
- ~2 s de espera por análisis,
- tiene **rate limit** y cuota de terceros,
- si Groq cae, el flujo degrada al heurístico (ya está previsto).

**Qué hacer:** al hacer prueba de estrés, **excluirlo o apagar `VALIDATOR_AI_*`**, o se
quema cuota. A futuro, si crece: encolarlo en vez de resolverlo en la petición.

### 🟡 4. Falta un índice en `dataroom_access_logs.user_id`

Es la única columna de filtro sin índice. Hoy da igual (pocas filas), pero la bitácora
solo crece. Se arregla con una línea.

### 🟢 Lo que NO es cuello de botella

Todos los endpoints de lectura responden bien y **no degradan** con el volumen actual:

| Endpoint | Mediana |
|----------|--------:|
| `GET /api/courses` | 6 ms |
| `GET /api/stats/activation` | 10 ms |
| `GET /api/notifications` | 10 ms |
| `GET /api/funds` (149 filas) | 11 ms |
| `GET /api/dataroom` (10 carpetas) | 12 ms |
| `GET /api/users/audit` | 15 ms |
| `GET /api/stats/me` | 18 ms |
| `GET /api/actors` (320 filas) | 34 ms |

`/api/actors` es el más lento porque devuelve las 320 filas sin paginar. A 320 no
importa; si el directorio creciera a miles, habría que paginarlo.

---

## 10. Techo estimado (con el hardware actual)

| Operación | Techo aproximado | Limitante |
|-----------|-----------------:|-----------|
| Lecturas (catálogos, dashboard) | **cientos/segundo** | Ninguno visible |
| **Logins** | **~2/segundo por núcleo** | **`bcryptjs`** |
| Descargas de documentos | ~10 simultáneas | RAM (`readFile` + copia) |
| Análisis con IA | ~1 cada 2 s | Groq (externo) |

**El login es el techo de todo el sistema.** Si mañana entran 100 personas a la vez,
lo que se cae no es el dashboard: es la puerta.

> ⚠️ Estos techos son **cálculo a partir de mediciones puntuales**, no resultado de una
> prueba de carga. Para confirmarlos hace falta la prueba de estrés (`PENDIENTES.md`
> §10.3) — y **no debe correrse en este VPS**, que comparte máquina con 34 contenedores
> de terceros.

---

## 11. Qué arreglar y en qué orden

| # | Acción | Esfuerzo | Ganancia |
|---|--------|----------|----------|
| 1 | `bcryptjs` → `bcrypt` nativo | Bajo (cambiar dependencia) | **Multiplica la capacidad de login** |
| 2 | Descargas por *stream* | Medio (3 archivos) | Deja de escalar la RAM con el tamaño del archivo |
| 3 | Índice en `dataroom_access_logs.user_id` | Trivial | Evita degradación futura |
| 4 | Retención de `site_visits` | Bajo | Impide que domine la base |
| 5 | Paginar `/api/actors` | Bajo | Solo si el directorio crece |

Los dos primeros son los que mueven la aguja. Los tres restantes son prevención.
