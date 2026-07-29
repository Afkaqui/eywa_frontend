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

---

# Parte 3 — Cuánto costaría en Google Cloud

> **Precios consultados el 28-jul-2026** en fuentes oficiales y de referencia (abajo).
> Los precios de nube **cambian**: antes de comprometer presupuesto, confirmar en la
> [calculadora oficial](https://cloud.google.com/products/calculator).
> Región asumida: **Tier 1 (`us-central1`)**. En São Paulo o Santiago sale más caro.

## 12. Precios usados en el cálculo

| Servicio | Precio | Nivel gratuito mensual |
|----------|--------|------------------------|
| **Cloud Run** — CPU | $0,000024 / vCPU-s | **180 000 vCPU-s** |
| **Cloud Run** — memoria | $0,0000025 / GiB-s | **360 000 GiB-s** |
| **Cloud Run** — peticiones | $0,40 / millón | **2 000 000** |
| **Cloud SQL** (`db-f1-micro`) | ~$8 / mes | — (siempre encendido) |
| **Cloud Storage** Standard | $0,020 / GB-mes | — |
| **Egress** (Premium, 1er TB) | $0,12 / GB | 1 GiB |

**Supuestos del modelo** (de la medición real de la Parte 2):
petición normal **30 ms**, login **447 ms**, instancia de **1 vCPU / 512 MiB**,
Cloud Run **escalando a cero**, y ~20 MB de archivos por empresa que usa el dataroom.

---

## 13. Resultado: costo estimado por escenario

| Escenario | Cloud Run | Cloud SQL | Storage | Egress | **TOTAL/mes** |
|-----------|----------:|----------:|--------:|-------:|--------------:|
| **Hoy** (7 usuarios) | $0,00 | $8,00 | $0,00 | $0,00 | **≈ $8** |
| **100 activos** | $0,00 | $8,00 | $0,04 | $2,28 | **≈ $10** |
| **1 000 usuarios** | $0,00 | $8,00 | $0,40 | $23,88 | **≈ $32** |
| **10 000 usuarios** | $2,67 | $8,00 | $4,00 | $239,88 | **≈ $255** |

### Los tres hallazgos que importan

**1. Cloud Run sale gratis hasta ~10 000 usuarios.**
Con 1 000 usuarios el consumo es de **22 470 vCPU-s** contra **180 000 gratuitos**: se usa
el **12 %** del nivel gratuito. El cómputo, que parece lo caro, no cuesta nada a esta
escala.

**2. El piso real es Cloud SQL: ~$8/mes, haya o no usuarios.**
Es lo único que se paga desde el día uno, porque una base gestionada está siempre
encendida. Con 7 usuarios, **el 100 % de la factura es la base de datos**.

**3. ⚠️ El egress domina todo lo demás — y es el que puede sorprender.**
Descargar documentos del dataroom cuesta **$0,12/GB**. Con 1 000 usuarios ya es el
**74 %** de la factura; con 10 000, el **94 %**. Es el único rubro que crece rápido, y
el más fácil de subestimar porque no aparece hasta que la gente usa la plataforma.

> **Mitigación del egress:** el *Standard Tier* de red cuesta $0,085/GB (~30 % menos) e
> incluye 200 GiB gratis al mes. Vale la pena evaluarlo antes de migrar.

---

## 14. Dos decisiones que cambian la factura más que el tamaño de la máquina

### 14.1 `min-instances` — la trampa de los $65/mes

Para evitar los *cold starts* de Cloud Run es tentador dejar **una instancia siempre
encendida**. Cuesta:

| | |
|---|---|
| CPU ociosa (730 h × 3 600 s × $0,000024) | **$63,07/mes** |
| Memoria | $2,39/mes |
| **Sobrecosto vs. escalar a cero** | **≈ $65/mes** |

Con 7 usuarios eso es **8 veces la factura entera**, para ahorrarle un segundo de espera
a nadie. **Recomendación: `min-instances=0`** hasta que haya usuarios que se quejen.

### 14.2 `bcryptjs` también se paga en la factura

En Cloud Run se cobra por vCPU-segundo, así que los **447 ms** del login del §9 no son
solo lentitud: son dinero.

| Implementación | vCPU-s/mes (10 000 usuarios) | Costo CPU |
|----------------|-----------------------------:|----------:|
| `bcryptjs` (actual) | 224 700 | $1,07 |
| `bcrypt` nativo (~4× más rápido) | 191 200 | $0,27 |

En dólares es poco. Lo relevante es otro: **con `bcryptjs` se cruza el umbral gratuito
de 180 000 vCPU-s; con el nativo, no.** El login es el 20 % del cómputo total pese a ser
una fracción mínima de las peticiones.

---

## 15. Comparación honesta con el VPS actual

| | VPS actual | Google Cloud (hoy) |
|---|---|---|
| Costo | Compartido con otros 34 contenedores | ≈ **$8/mes** |
| Modelo | Tarifa plana | **Por uso** |
| HTTPS backend | ❌ HTTP plano | ✅ Incluido |
| Deploy | Workaround AppArmor + `kill -9` | ✅ Estándar |
| Backups BD | Script propio | ✅ Gestionados |
| Aislamiento | Comparte con 34 servicios ajenos | ✅ Propio |
| Riesgo de factura | Ninguno | ⚠️ **Existe** |

**Lo que no se puede afirmar:** cuánto cuesta EYWA hoy en el VPS. Ese servidor lo paga
elastika y aloja 35 contenedores; no hay una cifra atribuible a EYWA sin una regla de
reparto que nadie definió. Comparar "$8 vs $X" sería inventar el $X.

---

## 16. Advertencias antes de comprometer presupuesto

1. **Configurar alertas de presupuesto el día uno.** El VPS no puede generar una factura
   sorpresa; la nube sí. Un bot indexando el dataroom o una prueba de estrés mal acotada
   generan egress real.
2. **Estos números asumen escalar a cero.** Con `min-instances=1` hay que sumar ~$65/mes.
3. **`db-f1-micro` no tiene SLA** ni descuentos por uso comprometido. Sirve para esta
   etapa; si EYWA pasa a producción seria, hay que subir de escalón (y de precio).
4. **No incluye:** el frontend (Vercel, plan aparte), Groq ni Resend (cuota propia), ni
   el costo de ingeniería de migrar.
5. **El egress es el rubro a vigilar.** Es el que crece con el uso y el que nadie
   presupuesta.

### Fuentes
- [Cloud Run pricing](https://cloud.google.com/run/pricing) · [Cloud SQL pricing](https://cloud.google.com/sql/pricing) · [Cloud Storage pricing](https://cloud.google.com/storage/pricing)
- [Google Cloud SQL Pricing 2026 (Usage.ai)](https://www.usage.ai/blogs/gcp/cloud-sql/pricing/) — `db-f1-micro` ≈ $7,67/mes (may-2026)
- [GCP egress pricing](https://egresscost.com/gcp/) — $0,12/GB Premium, $0,085/GB Standard

---

# Parte 4 — Capacidad: comportamiento ante X usuarios

> Medido el 28-jul-2026 contra el backend desplegado. La prueba de concurrencia fue
> **acotada a propósito** (~100 peticiones en segundos, menos carga que una persona
> navegando rápido): este VPS aloja 34 contenedores de terceros y no debe saturarse.

## 17. Consumo por operación

| Operación | Tiempo | Respuesta | Qué consume |
|-----------|-------:|----------:|-------------|
| `GET /api/courses` | 8 ms | 4,4 KB | BD |
| `GET /api/notifications` | 10 ms | 0,5 KB | BD (calcula al momento) |
| `GET /api/stats/me` | 13 ms | 0,3 KB | BD (5 consultas en paralelo) |
| `GET /api/dataroom` | 14 ms | **11,0 KB** | BD + arma 10 carpetas × 50 ítems |
| `GET /api/users/audit` | 14 ms | 2,0 KB | BD (5 consultas en paralelo) |
| `GET /api/portfolio` | 16 ms | 2,3 KB | BD + une organizaciones y manuales |
| `GET /api/actors` | 34 ms | **100,8 KB** | BD + serializa 320 filas |
| **`POST /api/auth/validate`** | **447 ms** | 0,2 KB | **CPU pura (bcrypt)** |
| `POST /plans/:id/analyze` | ~2 000 ms | 2 KB | Espera a Groq (externo) |

**La respuesta más pesada es `/api/actors` con 100,8 KB** — 9× la siguiente. Es el
directorio completo sin paginar.

---

## 18. 🔴 El hallazgo grave: el login congela el servidor

Dos mediciones que hay que leer juntas.

### 18.1 Los logins NO se paralelizan

| Logins en paralelo | Tiempo total | Por login | Throughput |
|-------------------:|-------------:|----------:|-----------:|
| 1 | 426 ms | 426 ms | 2,3/s |
| 2 | 826 ms | 413 ms | 2,4/s |
| 5 | 2 325 ms | 465 ms | 2,2/s |
| 10 | **4 549 ms** | 455 ms | **2,2/s** |

El throughput es **constante en ~2,2 logins/segundo** sin importar la concurrencia.
Diez personas entrando a la vez tardan 4,5 segundos; cien tardarían **45 segundos**.

### 18.2 Y mientras tanto, bloquean todo lo demás

Prueba: contar los ticks de un temporizador de 10 ms durante una tanda de bcrypt.

```
durante 2 143 ms de bcrypt:
ticks del temporizador: 5   (sin bloqueo serían ~214)
=> el bucle de eventos quedó disponible al 2 % del tiempo
```

**Durante un login, el backend está efectivamente congelado.** No es que los logins sean
lentos: es que **detienen todas las demás peticiones**. Un dashboard que responde en
13 ms pasa a esperar segundos si alguien está entrando al mismo tiempo.

> **Causa:** `bcryptjs` es JavaScript puro y corre en el hilo principal. La versión nativa
> (`bcrypt`) delega al *thread pool* de libuv y **no bloquea**. El `cost 12` está bien y
> no debe bajarse — el problema es la implementación, no el costo.

---

## 19. Latencia según concurrencia (lecturas)

Medido sobre `GET /api/dataroom`:

| En paralelo | p50 | p95 | Throughput |
|------------:|----:|----:|-----------:|
| 1 | 15 ms | 15 ms | 67 req/s |
| 5 | 39 ms | 42 ms | 106 req/s |
| 10 | 60 ms | 80 ms | 112 req/s |
| 20 | 99 ms | 147 ms | 126 req/s |
| 40 | 186 ms | 278 ms | **136 req/s** |

**El throughput se estanca en ~130 req/s.** A partir de ahí la latencia crece lineal con
la concurrencia — comportamiento clásico de cola sobre un bucle de eventos saturado.

Regla que se desprende: **latencia ≈ concurrencia ÷ 130 segundos**.

| Concurrencia | Latencia estimada |
|-------------:|------------------:|
| 100 | ~0,8 s |
| 200 | ~1,5 s |
| 500 | ~3,8 s |

*(Las tres son extrapolación de la recta medida, no medición directa.)*

Memoria: el proceso pasó de **49 MiB a 65 MiB** tras la prueba. Crece poco con la
concurrencia — la RAM no es el límite en lecturas.

---

## 20. Cómo se comportaría ante X usuarios

**Supuesto de comportamiento:** un usuario navegando genera ~0,1 peticiones/segundo
(unas 6 por minuto de uso activo). Los picos de login se concentran al inicio de jornada.

| Usuarios simultáneos | Lecturas | Login (todos a la vez) | Veredicto |
|---------------------:|----------|------------------------|-----------|
| **10** | 1 req/s — imperceptible | 4,5 s | ✅ Bien |
| **50** | 5 req/s — imperceptible | **22 s** | ⚠️ Login lento |
| **100** | 10 req/s — imperceptible | **45 s** | 🔴 Timeouts |
| **500** | 50 req/s — ~0,4 s | **3,8 min** | 🔴 Inservible |
| **1 300** | 130 req/s — **saturado** | — | 🔴 Techo de lecturas |

### Lectura en una frase

**Las lecturas aguantan más de 1 000 usuarios simultáneos. El login se cae a partir de
~50.** El cuello no está donde uno lo buscaría: no es la base de datos ni el tamaño de
las respuestas, es la puerta de entrada.

Y como el login **bloquea el bucle de eventos al 98 %**, no falla solo: arrastra a todos
los que ya estaban dentro navegando.

---

## 21. Rutas con mayor demanda

Dos formas de mirarlo:

### 21.1 Por frecuencia (cuántas veces se llama)
| Ruta | Cuándo se dispara | Frecuencia |
|------|-------------------|-----------:|
| `POST /api/stats/visit` | **Cada carga de página**, incluidos anónimos | 🔥 Máxima |
| `GET /api/auth/session` | Cada navegación (next-auth) | 🔥 Máxima |
| `GET /api/notifications` | Al entrar y al cambiar de vista | Alta |
| `GET /api/stats/me` | Dashboard | Alta |

### 21.2 Por costo (cuánto cuesta cada llamada)
| Ruta | Costo | Riesgo |
|------|-------|--------|
| `POST /api/auth/validate` | **447 ms de CPU bloqueante** | 🔴 Crítico |
| `POST /plans/:id/analyze` | ~2 s de espera + cuota Groq | 🟠 Externo |
| `GET /…/documents/:id/download` | Hasta 40 MB de RAM (archivo + copia) | 🟠 Memoria |
| `GET /api/actors` | 100,8 KB por respuesta | 🟡 Ancho de banda |

> ⚠️ **`stats/visit` es la ruta más llamada y escribe en BD cada vez.** Hoy no molesta,
> pero es la que más crece con el tráfico — y no tiene política de retención (§8).

---

## 22. Qué hacer, por impacto medido

| # | Acción | Efecto esperado |
|---|--------|-----------------|
| 1 | **`bcryptjs` → `bcrypt` nativo** | Deja de bloquear el bucle; el login pasa de ~2,2/s a decenas/s. **Es el único cambio que mueve el techo del sistema.** |
| 2 | Descargas por *stream* | La RAM deja de escalar con el tamaño del archivo |
| 3 | Paginar `/api/actors` | Corta la respuesta de 100,8 KB |
| 4 | Retención en `site_visits` | Impide que la tabla más escrita domine la BD |
| 5 | Índice en `dataroom_access_logs.user_id` | Prevención |

**El punto 1 es de otra categoría que los demás.** Los otros cuatro son mejoras; ese
cambia el techo de usuarios simultáneos que soporta la plataforma.

---

## 23. Cómo reproducir estas mediciones

Dentro del contenedor (`docker exec -it eywa_api sh`), con un script en `/app`:

- **Serialización del login:** lanzar N `bcrypt.compare` con `Promise.all` y medir el
  tiempo total. Si el throughput no sube con N, se están serializando.
- **Bloqueo del bucle:** arrancar un `setInterval` de 10 ms, correr bcrypt, y contar los
  ticks. Muchos menos ticks de los esperados = bloqueo.
- **Latencia vs concurrencia:** `Promise.all` de N `fetch` al mismo endpoint, midiendo
  p50/p95 y el tiempo de pared.

> ⚠️ **No ejecutar pruebas de carga sostenidas contra este VPS**: comparte máquina con
> 34 contenedores de terceros. Para una prueba de estrés real, levantar un entorno
> aparte (ver `PENDIENTES.md` §10.3).
