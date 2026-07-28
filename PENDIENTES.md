# EYWA — Plan de pendientes

> Registro vivo de lo proyectado, lo incompleto y lo que quedó fuera de alcance.
> **Regla:** todo lo que se proyecte se anota aquí. Cuando algo se implementa, se
> mueve a *Hecho* con su commit. Cuando se descarta, se anota por qué.
>
> Última actualización: 2026-07-25

---

## Cómo leer este documento

| Estado | Significado |
|--------|-------------|
| 🔴 **Bloqueante** | Impide que una funcionalidad publicada funcione, o depende de un tercero |
| 🟠 **Feature** | Trabajo nuevo, con alcance definido |
| 🟡 **Deuda** | Funciona, pero miente, está a medias o es frágil |
| ⚪ **Idea** | Proyectado, sin compromiso de fecha |

Los ítems con **UI retirada** significan que el cascarón visual se eliminó de la app
para no prometerle al usuario algo que no existe. La funcionalidad sigue pendiente aquí.

---

## 1. Simbiocreación

### 🧭 Modelo / visión (definido con el usuario, 2026-07-10)
**Una simbiocreación ES un proyecto** — la *idea a desarrollar*. La palabra "idea"
vive a nivel del proyecto completo, **no** como sub-elemento (ese era el error del
panel que listaba tags como "ideas").

El propósito del módulo es **dimensionar y maquetar** el proyecto en un grafo cuyos
nodos son **actores reales**:
- **Personal** (personas) — agregado a mano o **traído de Portafolio** (habrá una versión nueva).
- **Áreas** (internas).
- **Instituciones** (externas).

Mapeo desde el andamiaje actual → modelo objetivo:

| Nodo hoy | Concepto objetivo |
|----------|-------------------|
| `center` | el proyecto |
| `category` / `group` | áreas / instituciones |
| `person` (los `●` inventados) | personal / actores reales |

Implicaciones (reescriben pendientes de más abajo):
- El "grafo inventa participantes" deja de ser deuda: pasa a ser la feature de
  **agregar actores reales**; los `●` fantasma se eliminan.
- El botón muerto "Añadir participante" es el gancho de **añadir actor**.
- **Portafolio v2** es la fuente de actores que se pueden "llamar" a un proyecto
  → Simbiocreación queda acoplado a Portafolio por diseño.
- El panel "Mis grupos" (antes "ideas") se transforma en un panel de **Actores**
  (personal / áreas / instituciones). Los `tags` actuales quedan como paso previo
  hasta migrar a actores estructurados.

> Pendiente de arrancar cuando exista Portafolio v2 (define la forma del "actor").

### 🟠 Comentarios en simbiocreaciones — *UI retirada*
Había una caja "Escribe tu comentario..." con un contador `0 comentarios` escrito a
mano. El `<textarea>` no tenía `value`, ni `onChange`, ni botón de publicar, y no
existe modelo `Comment` en la base de datos. Un usuario podía escribir y asumir que
se guardaba. **Se eliminó el bloque** (frontend) hasta que exista el backend.

Para construirlo hace falta:
- Modelo `Comment` en Prisma: autor (`userId`), `simbiocreacionId`, `texto`, `createdAt`.
- Migración aditiva + rutas `GET/POST/DELETE /api/simbiocreacion/:id/comentarios`.
- Decidir permisos: ¿se comenta solo en simbiocreaciones públicas? ¿el dueño modera?
- Contador real (no hardcodeado) y avatar del **autor del comentario** (el cascarón
  usaba la inicial de la simbiocreación, así que todos los avatares habrían salido
  con la misma letra).

### ✅ Enlace "Link compartir" — RESUELTO (2026-07-10)
Existe visor público `/simbio/[id]` (sin login) que renderiza la simbiocreación no
privada con su grafo real; endpoint público `GET /api/simbiocreacion/public/:id`
(privadas → 404). El botón usa origin dinámico (sin dominio hardcodeado) y solo
aparece en públicas.

### 🟠 "Idea" — RESUELTO conceptualmente (ver Modelo/visión arriba)
Ya no hay ambigüedad: la simbiocreación **es** la idea/proyecto; no hay sub-"idea".
El panel "ideas" (que listaba tags) se renombró a **"grupos"** como paso intermedio y
su destino es convertirse en el panel de **Actores** (personal/áreas/instituciones).
Se retiró del panel el andamiaje ficticio (ver *Descartado*): niveles fabricados,
chevrons decorativos y el botón muerto "Añadir participante".

### ✅ El grafo auto-generado inventa participantes — RESUELTO (2026-07-16, Fase 5)
`buildGraph` ya NO inventa personas `●` ni grupos vacíos G1/G2: el auto-grafo solo dibuja
centro + categorías (ODS) + grupos de tags reales. Los actores se agregan en edición:
personas (vinculables a usuarios EYWA) e **instituciones** (vinculables al Directorio de
Actores vía `actorId`). El overlay muestra conteos reales (personas/instituciones del
grafo guardado, antes fingía tags×2) y la pestaña de Búsquedas pasó de "Personas" a
**"Actores"** (personas + instituciones, badges EYWA/Directorio).

### ✅ Puntaje sintético ELIMINADO — RESUELTO (2026-07-16)
Fuera el "puntaje" inventado (backend `total×10`, frontend `total×10+grupos×5`, que
además diferían entre sí). Ahora TODO son **métricas reales y transparentes**:
- Ranking: `total` simbiocreaciones · `publicas` · `actores` mapeados (nodos
  persona/institución en los grafos). Ordena por total.
- StatCard "Puntaje" → **"Actores Mapeados"** (conteo real de mis grafos).
Si negocio define algún día una fórmula de impacto, se agrega ENCIMA de estas
métricas, no reemplazándolas. Backend `562b072`, frontend `df3eb59`.

### ✅ `/public` sin token — RESUELTO (2026-07-16); `/ranking` autenticado a propósito
`GET /api/simbiocreacion/public` (lista para Explora) ya no exige sesión: solo devuelve
simbiocreaciones NO privadas, el mismo contenido que el visor `/simbio/[id]`.
**`/ranking` se queda AUTENTICADO deliberadamente**: expone nombres de usuarios y es un
leaderboard interno de la comunidad — no es deuda, es decisión.

---

## 2. Academia

### ✅ Página pública de verificación de certificados — HECHA (2026-07-16)
`/verificar` (formulario por código) y `/verificar/[codigo]` (enlace directo que
auto-verifica), públicas y con marca EYWA. Consume el `GET /api/certificates/verify/:code`
que ya era público, vía proxy sin sesión. Válido → titular, curso, instructor,
calificación y fecha; inválido → aviso claro. El PDF del certificado ahora imprime
el enlace directo de verificación. `9335a95`.

### 🟡 El seed general borra el curso demo
Correr `npm run db:seed` reinserta 6 cursos de ejemplo y **elimina** el curso demo
"Fundamentos de Sostenibilidad ESG". Si pasa, hay que re-aplicar
`eywa_api/prisma/seed-demo-course.sql` (es idempotente, no duplica).

### 🟡 Los otros 6 cursos no tienen contenido
Solo el curso demo tiene secciones y examen. Los demás muestran "Contenido en
preparación" — honesto, pero vacío. Falta cargar secciones, materiales y exámenes
(depende de contenido de negocio, no de código).

---

## 3. Autenticación

### ✅ Recuperación de contraseña — CONSTRUIDA Y DESPLEGADA (2026-07-25)
El botón "¿Olvidaste tu contraseña?" dejó de ser cascarón: ahora lleva a `/recuperar`.
Backend `0e7d573`, frontend `682ff7e`.

**Correo:** Resend con el dominio **`encsust4in4ble.earth`** (verificado en Resend;
comprobado por API antes de construir). Remitente `no-reply@encsust4in4ble.earth`.
Módulo `lib/mailer.ts` habla por `fetch` directo con la API REST — **sin SDK**, una
dependencia menos que mantener. Variables: `RESEND_API_KEY`, `MAIL_FROM`,
`PUBLIC_APP_URL` (declaradas en `docker-compose.yml`, si no NO llegan al contenedor).

**Flujo:** `/recuperar` (pedir enlace) → correo con enlace →
`/restablecer?token=…` (elegir contraseña). Endpoints `POST /api/auth/forgot-password`
y `POST /api/auth/reset-password`; proxies públicos; rutas agregadas a `publicPaths`.

**Decisiones de seguridad (deliberadas):**
- **No se revela si un correo existe**: la respuesta es idéntica exista o no la cuenta,
  para que nadie pueda enumerar quién está registrado. La UI dice "si el correo
  corresponde a una cuenta", no "te enviamos un correo".
- **El token no se guarda en claro**: en la BD va su SHA-256. Leer la base de datos NO
  permite tomar cuentas; el valor real solo existe en el correo.
- Un solo uso, expira en 60 min, invalida los anteriores al emitir uno nuevo, y al
  resetear invalida todos los del usuario (en una transacción).
- Anti-spam de 60 s por usuario, sin filtrar nada en la respuesta.
- Si el envío falla, el token se invalida: el usuario no queda esperando un correo que
  nunca llegó ni bloqueado por el cooldown.
- **Búsqueda de correo insensible a mayúsculas** — el registro guarda el correo tal cual
  se escribió; quien se registrara como `Juan@Gmail.com` no habría aparecido en una
  búsqueda en minúsculas, y por la respuesta genérica ese fallo habría sido INVISIBLE
  (vería "te enviamos el enlace" y nunca llegaría nada). Hoy todos los correos en prod
  están en minúsculas, pero eso era suerte, no garantía.

⚠️ **Gotcha del deploy (ya nos pasó):** el workflow recrea el contenedor al hacer push.
Si escribes variables nuevas en el `.env` del VPS DESPUÉS de ese push, llegan vacías —
hay que relanzar el deploy. Verificar siempre con
`docker exec eywa_api printenv MAIL_FROM`.

⚠️ **Pendiente menor:** el registro (`/api/auth/register`) y el login siguen guardando y
buscando el correo tal cual se escribe. Si alguien se registra con mayúsculas, tendrá que
escribirlo idéntico para entrar. Normalizar a minúsculas al registrar sería lo correcto,
pero toca el login de usuarios existentes → hacerlo con cuidado.

---

## 4. Validador de Proyectos IA

### ✅ Flujo desacoplado (crear / analizar / reportes) — HECHO (2026-07-10)
Reencuadre aplicado (decisión A(b) del usuario):
- **Crear ya no analiza** (se quitó el auto-`analyzePlan`); botón "Crear Proyecto".
- El heurístico se conserva pero **etiquetado honesto** como "Análisis preliminar
  (sin IA)" en badge, botón (tooltip) y banner del módulo.
- **Pestaña "Reportes"** que lista los proyectos con reporte (score ESG, riesgo,
  fecha) + estado vacío honesto.
- Quitados: promesa falsa "24-48 horas" y botón "Exportar" muerto.
- Backend sin cambios (ya estaba desacoplado: `POST /plans` vs `POST /plans/:id/analyze`).

Verificado con `tsc` + `next build` limpios. **No se pudo verificar el flujo interactivo
en vivo** (el módulo está tras login y no hay credenciales en esta sesión).

Sigue **bloqueado**: el análisis real con IA (abajo) y los documentos reales (B(b), abajo).

### ✅ IA del Validador ACTIVA con Groq (2026-07-24, DESPLEGADO)
**Decisión del usuario:** Groq como puente para el MVP; "IA operativa" como afirmación
formal se reserva para cuando se consiga el fondo. El *seam* era compatible con OpenAI,
así que Groq entró sin cambiar código: solo `VALIDATOR_AI_URL/KEY/MODEL` en el `.env`
del VPS. Modelo: `openai/gpt-oss-120b`.
**Verificado end-to-end en producción** ejecutando el código desplegado dentro del
contenedor: `generatedBy: 'ai'`, ~2 s, JSON con la forma exacta de `ValidationReport`.

Dos fallos silenciosos que se encontraron y corrigieron al activarlo:
1. `docker-compose.yml` **no reenviaba** las variables `VALIDATOR_AI_*` al contenedor:
   aunque estuvieran en `.env`, `isAiConfigured()` daba false y seguía en heurístico
   **sin ningún error** (`baedb7b`).
2. Groq está detrás de Cloudflare y responde **403 "error code: 1010"** a clientes sin
   `User-Agent` reconocible. Se añadió cabecera explícita (`3cd6157`); sin ella la
   llamada habría fallado y el fallback lo habría ocultado.

UI actualizada (`48729d1`): la etiqueta sale del dato (`report.generatedBy`), no de
texto fijo — "Análisis con IA" (verde) o "Análisis preliminar" (ámbar) si cae al
heurístico. Nunca vuelve a desincronizarse.

⚠️ **Pendiente asociado:** ARS sigue siendo el proveedor previsto a futuro; cambiar
son las mismas 3 variables.

### ✅ Fase 3 — lectura de documentos adjuntos: CONSTRUIDA PERO DORMIDA (2026-07-25)
El backend ya extrae el texto de los archivos subidos a un plan (PDF/Word/Excel/TXT/
CSV) y lo agrega al prompt de la IA como contexto. **La extracción la hace el backend**
con librerías locales (`pdf-parse` fijado en 1.1.1, `mammoth`, `xlsx`); el modelo solo
recibe TEXTO, así que **Groq lo soporta sin API especial** (no hacía falta un proveedor
que "acepte documentos"). Módulo: `services/document-text.ts`; enganchado en
`analyzeProjectPlan`. Presupuesto de caracteres (8k/doc, 20k total) para no exceder la
ventana de contexto; nunca rompe el flujo (ante error devuelve ''); imágenes se omiten
(requerirían OCR/`tesseract`, fuera de alcance).
**Apagada por defecto** con `VALIDATOR_READ_DOCS` (vacío en el VPS). Commits `6d68e2d`
(feature) + `3041eac` (fix del pin de pdf-parse: npm había resuelto 2.x y rompía).

#### 🔌 Cómo ENCENDERLA (procedimiento exacto)
Es **una sola variable**, pero hay que **recrear el contenedor**: `docker-compose` lee el
`.env` al crear el contenedor, así que agregar la línea no basta por sí solo.

```bash
# 1. Agregar el flag al .env del VPS (idempotente: no duplica si ya está)
ssh kaqui@161.132.54.226 'cd ~/eywa-backend && grep -q "^VALIDATOR_READ_DOCS=" .env || echo "VALIDATOR_READ_DOCS=true" >> .env'
```

```bash
# 2. Recrear el contenedor para que tome la variable.
#    La vía limpia es relanzar el deploy: GitHub -> repo eywa_backend -> Actions ->
#    "Deploy backend al VPS" -> Run workflow (workflow_dispatch). Ya hace el
#    workaround de AppArmor (update --restart=no, kill -9, rm, compose up -d).
```

```bash
# 3. Verificar que el flag llegó al contenedor (debe imprimir: flag=[true])
ssh kaqui@161.132.54.226 'echo "flag=[$(docker exec eywa_api printenv VALIDATOR_READ_DOCS)]"'
```

**Para APAGARLA:** quitar la línea del `.env` (o ponerla en `false` — solo el literal
`true` activa) y repetir el paso 2. El código sigue ahí, inerte.

**Verificado en prod (2026-07-25)** con el flag encendido solo en el proceso de prueba
(`docker exec -e VALIDATOR_READ_DOCS=true ...`, sin tocar el contenedor): extrajo 8108
chars de un PDF real y las palabras del PDF (`Pilpus`, `logística`, `Transcripción`,
`financiamiento`) aparecieron en el cuerpo enviado a Groq; el prompt pasó de 2 287 a
10 627 chars.
⚠️ **Privacidad al encender:** el texto COMPLETO de los documentos subidos (con cualquier
PII que contengan) se envía a la API de Groq. Tenerlo en cuenta antes de activarla.
⚠️ **PDF escaneado / imagen:** no se leen (se omiten en silencio). Un usuario que suba un
PDF escaneado creerá que se analizó su contenido. Si pasa a ser común → OCR (`tesseract`).
⚠️ **`xlsx` (SheetJS de npm) arrastra advisories sin fix publicado.** Riesgo acotado (solo
procesa archivos que el propio dueño subió, con tipo y tamaño ya validados), pero anotado.

### ✅ Subida real de documentos — FASES 1 Y 2 HECHAS (2026-07-16, DESPLEGADO)
Tabla `plan_documents` (cascade con project_plans) + storage en el volumen VPS
(`UPLOAD_DIR/validator/<planId>/`). Endpoints: POST multipart (PDF/Word/Excel/imagen/
TXT/CSV, 10 MB, límite free=1 / premium=10 verificado contra BD), GET download (solo
dueño), DELETE por documento; borrar el plan limpia su carpeta del disco. UI: el
formulario sube archivos REALES al crear (reintento sin duplicar el plan); cada card
tiene sección Documentos con adjuntar/descargar/eliminar. El Json legado
`project_plans.documents` queda ignorado. Backend `a5cfe0d`, frontend `e6ac5cd`.
**Fase 3 (extracción de texto para la IA): CONSTRUIDA PERO DORMIDA** (ver arriba en §4,
sección IA del Validador) — se enciende con `VALIDATOR_READ_DOCS=true`.

### 🟠 Plan de trabajo original (B(b), referencia)
**Estado hoy:** el campo `documents` (Json) guarda solo **metadata** (nombre/tipo);
el archivo no se sube a ningún lado. Para que la IA (y el usuario) tengan el contenido
real hace falta almacenamiento + extracción de texto. Plan por fases:

**Fase 1 — Almacenamiento de archivos**
- **DECIDIDO (usuario 2026-07-14): storage en el DISCO DEL VPS** (no R2). Carpeta dedicada
  servida por el backend. **Es infraestructura COMPARTIDA con el Dataroom (§8).** Ojo
  operativo: el VPS es compartido (~27 contenedores) → usar una carpeta/volumen dedicado,
  incluirla en los backups (`~/backups`), y controlar espacio en disco.
- Backend: endpoint `POST /api/validator/plans/:id/documents` que reciba `multipart/form-data`,
  valide (tipo permitido: pdf/docx/xlsx/img; tamaño máx p.ej. 10 MB; límite por plan según
  plan free/premium), guarde el binario y devuelva `{ id, name, url, size, mime }`.
- Modelo: cambiar el shape de `documents` de metadata a `{ id, name, url, size, mime, uploadedAt }[]`,
  o crear tabla `PlanDocument` (mejor para borrar/listar individualmente). Migración aditiva.
- Endpoint `DELETE /api/validator/plans/:id/documents/:docId`.
- Seguridad: verificar propiedad del plan; URLs firmadas/temporales si el bucket es privado;
  nunca exponer el bucket completo.

**Fase 2 — Frontend de subida**
- Reemplazar el input actual (que solo captura nombres) por subida real con barra de
  progreso, validación de tipo/tamaño en cliente, y lista de archivos ya subidos con
  opción de eliminar. Respetar el límite del plan (free = 1 doc, premium = varios).

**Fase 3 — Extracción de texto (para la IA)**
- Al subir, extraer texto: PDF (`pdf-parse`/`pdfjs`), DOCX (`mammoth`), XLSX (`xlsx`),
  OCR para imágenes si aplica (`tesseract`). Guardar el texto extraído para pasárselo
  al validador cuando ARS entregue la IA.
- Esto conecta con "Enchufar la API de IA real": el análisis real necesita este texto.

**Dependencias/decisiones abiertas:** elegir storage (costo vs simplicidad), definir
límites por plan (free/premium), y si el texto extraído se guarda en la BD o en el storage.

---

## 7. Directorio de Actores (nuevo módulo — 2026-07-10)

**Origen:** dos "mapas de actores" del ecosistema de inversión de impacto en
`C:\Users\Asus\Desktop\EYWA\actores\`: NAB Perú (232 orgs, 15 campos, taxonomía completa)
y NAB Colombia (89 orgs, 5 campos). Son el catálogo de **instituciones** del ecosistema.

**Decisiones (con el usuario, 2026-07-10):**
- **Tabla maestra nueva `Actor`**; el Portafolio la **consume** (no se fusiona con
  `PortfolioCompany`). Simbiocreación también la jala (Panel de Actores).
- **Global, curada por gestor/admin** (data compartida; todos la navegan).
- **Taxonomía EYWA unificada + campo `country`** (base = la de Perú; Colombia se mapea).
- **Contacto/correo (PII): se guardan pero visibles solo a gestor/admin**; el directorio
  general muestra web/descripción, no PII (serializador según rol).

**Taxonomía unificada (5 categorías)** con mapeo de Colombia:
| EYWA | Perú | Colombia |
|------|------|----------|
| Proveedores de Capital | Proveedores de Capital | Oferentes de capital |
| Intermediarios | Intermediarios | Intermediación de capital + Constructores de mercado |
| Bancos | Bancos | — |
| Gobierno y Multilaterales | Gobierno y multilaterales | — |
| Empresa Social | Empresa social | — |

**Modelo `Actor` (superset, campos nulables):** `name`, `country` (PE/CO), `category`
(enum unificado), `subcategory?`, `description?`, `services?`, `procedencia?`, `geoScope?`,
`instruments Json` (array), `sectors Json` (array), `aum?`, `investmentAmount?`, `website?`,
`contactName?` (PII), `contactEmail?` (PII), `source` (archivo origen), `createdBy`, timestamps.

**Plan por fases:**
1. ✅ **HECHO** — Modelo `Actor` + migración + rutas `/api/actors` (filtros país/categoría/
   sector/instrumento/búsqueda + facets; GET :id; CRUD gestor+; **PII oculta salvo gestor/admin**).
2. ✅ **HECHO** — Importador (Python → seed SQL idempotente). **320 actores cargados en prod**
   (PE 232, CO 88). Taxonomía Colombia mapeada + 7 outliers reclasificados + `subcategory`
   preserva el origen. Distribución: intermediarios 146, proveedores_capital 92, empresa_social 42,
   gobierno_multilaterales 22, bancos 18. Script: `scratchpad/import_actores.py`, seed: `prisma/seed-actors.sql`.
3. ✅ **HECHO** — Frontend directorio (`ActorsDirectory`): buscar + filtrar por país/
   categoría/sector, chips con conteo, cards, panel de detalle, PII gateada por rol.
   **Vive DENTRO de Portafolio** como pestaña "Directorio de Actores" (no es módulo de
   nav aparte; decisión del usuario 2026-07-13). `ActorsDirectory` acepta `embedded`.
   ✅ **UI de CRUD admin — HECHA (2026-07-16, `b4a7b76`)**: botón "Agregar actor" en los
   filtros + Editar/Eliminar en el detalle, visibles solo con `can_edit` (el backend
   revalida el rol). Modal con todos los campos; sectores/instrumentos por coma (datalist
   con los existentes); PII en bloque ámbar aparte con aviso; eliminar advierte que afecta
   a TODOS los usuarios; nombre+país duplicado da mensaje claro (hay `@@unique`).
   OJO: como en Fondos, re-correr `seed-actors.sql` es destructivo — si llega una fuente
   actualizada, fusionar en vez de reemplazar para no perder lo agregado a mano.
4. ✅ **HECHO (reformulada)** — Favoritos personales.
   **Decisiones del usuario (2026-07-14):** el directorio/portafolio es **GLOBAL y solo
   admin/gestor lo modifica**; los usuarios pueden marcar **favoritos** (lista personal).
   **Se DESCARTÓ `PortfolioCompany.actorId`**: un actor NO es una empresa de portafolio y
   **no necesita score ESG** ("eso es exclusivo de los usuarios") — meterlo ahí lo obligaba
   a tener un score que no le corresponde.
   Construido: modelo `ActorFavorite`, `POST/DELETE /api/actors/:id/favorite` (idempotente),
   filtro `?favorites=true`, campos `is_favorite`/`can_edit`. UI: estrella en card y detalle
   + filtro "Favoritos" con contador. **Verificado en vivo**: usuario normal NO puede editar
   el directorio (403) pero SÍ marcar favoritos; los favoritos son aislados por usuario.
   - ✅ **"Fondos" — CONSTRUIDO Y DESPLEGADO (2026-07-16)**. Fuente:
     `BD_Fondos/Neo - Hoja Matriz de oportunidades.xlsx` (146 fondos: 131 internacionales
     + 15 nacionales, sin PII). Decisiones del usuario: **pestaña en Portfolio** (junto a
     Actores), **solo Premium** (gestor+ también; plan verificado contra BD, free ven teaser
     honesto con conteos vía `GET /api/funds/summary`), campos internos de Neo
     (prioridad/estado/responsable) **descartados**, vencidos visibles con badge "Cerrado"
     + filtro. Modelo `Fund` (scope, instrumentType, eligibleProfile, sectors, amounts,
     deadline/deadlineText, checklist, url), seed idempotente `prisma/seed-funds.sql`
     (generador en scratchpad `gen_funds_seed.py`). UI `FundsDirectory.tsx`: búsqueda +
     filtros ámbito/instrumento/vigencia, filas expandibles con Gate 0 y link.
     Backend `ee72850`, frontend `179db65`.
     ✅ CRUD para gestor+ (2026-07-16): agregar/editar/eliminar fondos inline en la
     pestaña Fondos (backend `e8fbe33`, frontend `89ee7b4`).
     ✅ **El seed ya NO es destructivo (2026-07-28, `151912b`).** `seed-funds.sql`
     empezaba con `DELETE FROM funds` y se anunciaba "idempotente" — lo era solo si
     nadie más tocaba la tabla. Re-correrlo borraba **todo fondo cargado a mano desde
     la UI** y habría borrado los 4 de Eduardo; además revertía la corrección de la
     fecha del 100+ Accelerator. Arreglado de raíz:
     - `UNIQUE` en `funds.name` → el seed hace **UPSERT** en vez de vaciar la tabla.
     - Para crear ese índice hubo que consolidar **"GEF Small Grants (UNDP)"**, que la
       matriz Neo traía DOS VECES (misma convocatoria, redacción distinta, mismo URL).
     - La fecha del 100+ se corrigió **en el propio seed**, para no re-parchear la BD
       después de cada import.
     - **`seed-funds-extra.sql`**: los 4 fondos de Eduardo, versionados. Antes vivían
       solo en la base de datos.
     Los dos seeds se corren en cualquier orden y las veces que haga falta:
     ```
     docker exec -i postgres_db psql -U admin -d eywa_db < prisma/seed-funds.sql
     docker exec -i postgres_db psql -U admin -d eywa_db < prisma/seed-funds-extra.sql
     ```
     Verificado en prod: re-correr el seed dejó los 4 intactos y no revirtió el 100+;
     el extra corrido dos veces no duplicó nada (149 fondos antes y después).
     ⚠️ **`seed-actors.sql` sigue haciendo `DELETE FROM`** — mismo riesgo, sin arreglar.
5. ✅ **Simbiocreación Fase 5 — HECHA (2026-07-16)**: nodo tipo **"Institución"** en el
   grafo, vinculable a un actor real del Directorio (búsqueda sobre los 320; el nodo
   guarda `actorId`; badge "Directorio"; desvincular). Zod del backend acepta
   `institution` + `actorId`. Además se eliminaron los participantes fantasma
   (ver §1). Backend `8774776`, frontend `9ddf2c6`.

**Abierto:** confirmar el mapeo fino de subcategorías/sectores/instrumentos al importar
(algunos textos de los Excel vienen con espacios/variantes).

---

## 9. API pública / de datos y cálculo (proyectado 2026-07-14 — EN EXPLORACIÓN, no construir aún)

**Idea:** exponer los datos y los cálculos de EYWA vía API. Dos naturalezas con riesgos
distintos → **dos capas** (decisión del usuario 2026-07-14: keys por consumidor, límites
por usuario, revocables, permisos ajustables, + una capa pública).

**Capa PÚBLICA (sin key, rate-limit por IP):** bajo riesgo, solo lectura.
- `GET /v1/actors`, `/v1/actors/:id`, `/v1/actors/facets` — directorio de 320 actores
  **SIN PII** (contacto/correo nunca salen). La lógica de filtrado ya existe.
- `GET /v1/certificates/verify/:code` — verificación de certificados (ya es público hoy).

**Capa con API KEY (por consumidor):** para cálculos y datos sensibles.
- `POST /v1/esg-score` — recibe datos de un proyecto → devuelve el reporte del Validador
  (`overallScore`, `esgScores {E,S,G}`, `riskLevel`, `viability`, fortalezas/debilidades/
  recomendaciones, **`generatedBy: heuristic|ai`**). Motor YA construido (`validator-service.ts`).
- `POST /v1/diagnostic/score` — recibe respuestas → score + nivel + desglose (motor listo;
  ojo: preguntas hoy placeholder).
- `POST /v1/match` — **el caso estrella**: score ESG + a qué financiadores del directorio
  encaja (une cálculo + datos; es la tesis de EYWA vuelta API).
- Endpoints con PII solo para keys con scope explícito.

**Modelo `ApiKey` (a construir):** `hash` de la clave, `consumerName`, `scopes[]`
(actors:read, esg:score, pii:read…), `rateLimit`/`quota`, `status` (activa/revocada),
`tier`, `createdBy`, `lastUsedAt`, `revokedAt`. Middleware que valida la key, aplica el
scope y cuenta el uso. UI de admin (superadmin) para crear/revocar/ajustar.

**⚠️ Reglas innegociables para la capa de CÁLCULO (un score es un dictamen):**
1. Etiquetar el origen (`generatedBy`) y, mientras sea heurístico, marcar el resultado
   como **"puntaje preliminar — no es una calificación crediticia ni una certificación"**.
2. Metodología **documentada y versionada** (`/v1/`); definir reproducibilidad cuando entre IA.
3. Nunca abierta sin key; medir uso, poder revocar.

**Caso de uso concreto (usuario 2026-07-14): la empresa embebe SUS datos en SU web.**
Un widget/badge "ESG verificado por EYWA" en la página del cliente. **Fuente ya construida:**
`GET /api/dataroom/public/:slug` (creado para la mini-landing) ya devuelve en JSON el perfil,
el % de completitud y los documentos públicos de esa empresa. Falta para volverlo producto:
- Endpoint versionado estable `GET /v1/empresa/:slug` + **CORS** (que el navegador del cliente lo llame).
- **Badge copy-paste** (`<script data-empresa="slug">` → sello con % y enlace al perfil) → el de mayor
  adopción; no exige que el cliente sepa programar y reparte marca EYWA por la web.
- Sumar al payload (opt-in) el **índice ESG/nivel** y las **certificaciones** de la Academia.
- Privacidad: solo lo marcado como público (misma regla de dos capas ya verificada).
- Honestidad: si el score es heurístico, el badge dice "autoevaluación/preliminar", no "certificado".
Es un **quick win**: la fuente de datos ya existe y está probada; el trabajo es empaquetado + CORS + badge.

**Abierto:** ¿API gratuita, freemium o de pago? ¿open data del directorio con licencia (CC)?
Definir el producto antes de construir.

---

## 8. Dataroom por empresa — ✅ BASE CONSTRUIDA (2026-07-14)

**Vive en "Mi Organización" → pestaña "Dataroom".** Verificado en vivo:
- Plantilla en BD: **10 carpetas / 50 documentos requeridos**.
- **Subida real al disco del VPS** (volumen `/home/kaqui/eywa-uploads:/app/uploads`
  en docker-compose — **imprescindible**: el auto-deploy recrea el contenedor y sin el
  volumen los archivos se perderían en cada push).
- Valida tipo (pdf/office/imagen/csv) y 20 MB; sanea el nombre (anti path-traversal).
- Descarga **íntegra** (byte a byte igual al original); **otro usuario → 403**.
- **% de completitud** global y por carpeta.
- Todo documento **nace privado** (`is_public=false`); publicar es explícito y por documento.

**FALTA (en orden de valor):**
1. ✅ **Mini-landing pública** `/empresa/[slug]` — HECHA (2026-07-15/16): cabecera con
   logo de la empresa + marca EYWA, sello de completitud, documentos públicos descargables.
2. ✅ **Invitaciones** (inversores/auditores) — HECHO (2026-07-26, backend `bac6a1f`,
   frontend `79b0428`). Destrabado al quedar Resend operativo.
   **Decisión de diseño: el invitado NO crea cuenta.** En una due diligence nadie se
   registra para revisar documentos; se abre el enlace y se revisa. A cambio el acceso
   es acotado y auditable:
   - Token solo en el correo; en la BD va su **SHA-256**. Vence a los **30 días**.
   - Revocable en cualquier momento por el dueño.
   - Token inexistente / revocado / vencido → **el mismo 404** (no se filtra cuál fue).
   - La descarga valida que el documento sea **de la organización que invitó**: si no,
     un invitado podría pedir documentos de otra empresa con su token válido.
   - Cada descarga queda en la bitácora **atribuida a la invitación** (columna nueva
     `invitation_id`); sin eso el caso más sensible se registraría como "Visitante".
   - **Solo el DUEÑO invita**: un gestor con acceso delegado tiene permiso de lectura,
     no de repartir accesos a documentos ajenos.
   - Si el correo no sale, la invitación **se revoca** en vez de figurar como "enviada"
     con un token que nadie recibió.
   ⚠️ El invitado ve el dataroom **COMPLETO**, no la mini-landing (que solo muestra lo
   marcado como público). La UI lo advierte antes de invitar. Al revocar también se
   aclara que **los documentos ya descargados no se recuperan**.
   Verificado en producción: ver 10 carpetas/16 docs, descarga 200 (112 KB PDF),
   documento de otra empresa → 404, revocada → 404, vencida → 404, y la bitácora
   registró "Inversor de Prueba" en vez de "Visitante". Datos de prueba borrados.
3. ✅ **Permiso delegado a gestores** — HECHO (2026-07-16): `DataroomAccessGrant`; el
   superadmin da/revoca acceso desde Administración; el gestor ve sus datarooms
   delegados en Gestión de Datos → Datarooms, en **solo lectura** (ver + descargar;
   subir/borrar/publicar sigue siendo del dueño). Decisión del usuario: solo lectura.
4. ✅ **Registro de accesos** — HECHO (2026-07-16): `DataroomAccessLog`; toda descarga
   queda en bitácora (con usuario; las públicas de la mini-landing como "Visitante").
   El dueño la ve en su Dataroom → "Registro de accesos". El log nunca rompe descargas.
5. ✅ **Auto-marcar carpeta ASG** — HECHO (2026-07-16, decisión: ítems marcados, sin
   generar archivos): "Reporte de sostenibilidad" ← diagnóstico GENES hecho;
   "Certificaciones de calidad / sostenibilidad" ← certificados de la Academia. Badge
   "Completo vía plataforma" + nota; cuentan para el % (también en el sello público).
   OJO: el match es por NOMBRE exacto del ítem — si se renombran en la plantilla, actualizar
   `platformCompletions()` en el repo backend. Backend `5ec8779`, frontend `51db15f`.
6. ✅ Incluir `~/eywa-uploads` en los backups del VPS — HECHO (pg_backup.sh lo tarea).

### Referencia y diseño original (proyectado 2026-07-13)

**Idea (del usuario):** se creará **un dataroom por empresa**; el contenido de cada uno
lo definirá el usuario más adelante ("luego te pasaré qué debe tener cada uno").

**Decisiones (usuario 2026-07-14):**
- **La "empresa" es `Organization`** — la organización vinculada a la cuenta del usuario
  (1:1 con `Profile`, ya existe el módulo `OrganizationProfile`). → **Un dataroom por
  organización.** El dataroom cuelga de `Organization`, no de PortfolioCompany ni Actor.
- **Storage en el DISCO DEL VPS** (misma infra que Validador §4, compartida).

Un dataroom = **repositorio de documentos de la organización + control de acceso** (típico
en due diligence / inversión: financieros, ESG, legal, etc.).

**ESTRUCTURA DESEADA** (referencia dada por el usuario 2026-07-14:
https://qoryladataroom.netlify.app/ — "QORY LAB Data Room"):

> ⚠️ La referencia mezcla dos capas. **El dataroom es la capa 1**; la capa 2 son
> dashboards propios de esa empresa (estados financieros con partidas/notas, presupuestos
> con proyecciones, organigrama) → **fuera del alcance del dataroom genérico**.

**Capa 1 — El dataroom = 10 carpetas, cada una con un CHECKLIST de documentos requeridos
y un ESTADO por documento (✅ Completo / ⏳ Pendiente / ❌ Faltante):**

| # | Carpeta | Documentos requeridos |
|---|---------|----------------------|
| 1 | **Panorama** | Directorio ejecutivo (directivos, cargo, nivel jerárquico → organigrama); Actividad principal |
| 2 | **Legal y Societario** | Testimonio de constitución y estatutos · Partida registral (copia literal) · Poderes y vigencia · Modificaciones estatutarias · Libros societarios · Convenios de accionistas |
| 3 | **Tributario** | Ficha RUC · Declaraciones juradas (anuales/mensuales) · Comprobantes de pago · Constancias de libros contables · Informes de auditoría tributaria · Certificados de no adeudo |
| 4 | **Financiero y Contable** | Estados financieros (anuales y trimestrales) · Informes de auditoría financiera · Presupuestos y proyecciones · Contratos de deudas y financiamientos · Reportes de valorización |
| 5 | **Negocio y Operaciones** | Descripción del modelo de negocio · Diagramas de procesos clave · Licencias y permisos |
| 6 | **Cumplimiento y Políticas internas** | Manual de políticas y procedimientos · Código de ética y conducta · Reglamento interno de trabajo (RIT) · Documentación SPLAFT · Declaraciones juradas de empleados · Informes de auditorías de cumplimiento |
| 7 | **Sostenibilidad y ASG** | Reporte de sostenibilidad · Política de sostenibilidad y RSE · Mediciones de impacto ambiental · Informes de impacto social · Certificaciones de calidad/sostenibilidad · Catálogo de proyectos de impacto |
| 8 | **Comercial y Mercado** | Contratos marco (clientes/proveedores) · Lista de clientes y proveedores clave · Políticas de precios y ventas · Material de marketing y ventas · Estudios de mercado y competencia |
| 9 | **Talento Humano** | Organigrama · Modelos de contratos de trabajo · Políticas de contratación y salarios · Estructura de planillas y bandas salariales · Planes de desarrollo y capacitación · Formatos de evaluación de desempeño |
| 10 | **Propiedad Intelectual y Tecnología** | Títulos de registro de marcas y patentes · Contratos de licencia de software · Registro de dominios web · Política de seguridad de la información · NDAs |

**Otros patrones a replicar de la referencia:**
- **% de completitud** por carpeta y global (deriva de los estados) → métrica de "empresa
  lista para financiamiento". **Encaja con el ADN de EYWA (Trust Score / dato honesto).**
- **Nomenclatura sugerida:** `Contrato_Cliente_XYZ_2024-03-15.pdf`.
- **Mantenimiento:** responsable asignado + revisión cada 3-6 meses.
- Ellos usan Google Drive/Dropbox; **nosotros: disco del VPS** (ya decidido).

**Sinergia con EYWA:** la **Carpeta 7 (Sostenibilidad y ASG)** es literalmente el core de
EYWA → puede alimentarse del Diagnóstico ESG, el panel ESG y los certificados. Y un dataroom
completo + el **Directorio de Actores** (proveedores de capital) = el puente natural
empresa→inversor.

**Modelo propuesto:**
- Plantilla (global, seed): `DataroomFolder` (10, con orden y descripción) y `DataroomItem`
  (documento requerido dentro de cada carpeta).
- Por organización: `DataroomDocument` (`organizationId`, `itemId`, archivo en disco del VPS,
  `name`, `mime`, `size`, `uploadedBy`, `status`, timestamps). El **estado** se deriva de si
  hay archivo (o se marca "no aplica").
- Endpoints bajo `/api/organization/dataroom` (listar plantilla + estado, subir, borrar).

**CONTROL DE ACCESO (definido por el usuario 2026-07-14):**
- El dataroom **pertenece a la `Organization` vinculada al usuario**.
- **Invitación:** el dueño invita a terceros (inversores, auditores) a ver el dataroom.
- **Enlace público opcional:** genera una **mini-landing de la empresa**.

> ⚠️ **REGLA DE SEGURIDAD (no negociable).** El dataroom contiene declaraciones de
> impuestos, estados financieros, NDAs, contratos y planillas salariales. **"Hacerlo
> público" NO puede exponer esos documentos.** Diseño en dos capas:
>
> | Capa | Quién ve | Qué |
> |------|----------|-----|
> | 🔒 **Dataroom** | Dueño + **invitados** | Los ~50 documentos reales |
> | 🌐 **Mini-landing** (`/empresa/[slug]`) | Cualquiera con el enlace | Perfil de la empresa, score ESG, **% de completitud (sello de confianza)**, certificaciones, proyectos de impacto, y **solo los documentos que el dueño marque como públicos** uno por uno |
>
> **Todo documento nace PRIVADO.** Publicar es una acción explícita y por documento.

**Modelo de acceso:**
- `Organization`: `dataroomPublic` (bool, default false) + `slug`/`publicCode` (URL de la landing).
- `DataroomInvitation`: `organizationId`, `email`, `token`, `expiresAt`, `acceptedAt`, `revokedAt`.
  (Requiere envío de correo → misma dependencia que la recuperación de contraseña, §3.)
- `DataroomDocument.isPublic` (bool, default **false**) → gobierna qué sale en la mini-landing.

**Roles internos de EYWA (definido por el usuario 2026-07-14):**
- **Superadmin: ve TODO** (todos los dataroom de todas las empresas).
- **Gestor: solo ve lo que el superadmin le habilite** (acceso delegado, no automático).
- **Admin / usuario normal: nada** (salvo su propia organización).
- → Modelo: `DataroomAccessGrant` (`userId` del gestor, `organizationId`, `grantedBy`,
  `createdAt`, `revokedAt?`). El superadmin concede/revoca. *A definir:* si el permiso es
  por **organización completa** (recomendado, más simple) o por carpeta.
- Como el superadmin accede a documentos sensibles (impuestos, planillas, NDAs), conviene
  un **registro de accesos** (quién vio qué y cuándo) — auditable. *Sugerido, a confirmar.*

**Sinergia:** la mini-landing es el mismo patrón que el visor público `/simbio/[id]` que ya
construimos (ruta pública + proxy sin token + 404 si no es pública). Receta conocida.

### 🟡 El middleware de rutas no protege nada
`src/middleware.ts` define `publicPaths` con `'/'` y usa `pathname.startsWith(p)`.
Como **todo** path empieza con `/`, `isPublic` siempre es `true` y el redirect a login
nunca se dispara. El gateo real hoy es 100% client-side (`page.tsx` muestra `LoginPage`
si no hay `user`). No es un agujero grave porque las APIs sí validan el JWT en backend,
pero el middleware da una falsa sensación de protección. Si se corrige el matcher,
**verificar que `/simbio` y `/api/proxy/simbiocreacion/public` sigan accesibles** (ya
están listados explícitamente en `publicPaths`).

---

## 5. Datos y KPIs

### ✅ KPIs reales — RESUELTO en el dashboard (2026-07-18)
**Hallazgo:** los KPIs en "Pendiente" no esperaban conexión, esperaban **datos que nadie
captura** (carbono, valorización USD, gap IMI, auditorías). Se decidió **jubilarlos y
cambiar la pregunta**: medir lo que la plataforma sí sabe.

`HeroDashboard` ahora muestra (backend `9687dfd`, frontend `cb42f73`):
- **Tu mayor brecha** (categoría GENES más baja + criterios en cero)
- **Evolución del índice** (variación vs. la evaluación anterior)
- **Dataroom completo** (%)
- **Fondos por cerrar** (+ próximo a vencer)
- Academia: cursos inscritos, **horas formativas reales** (`duration_hours`) y progreso.

`GestorDashboard`: **embudo de activación** (registrados → organización → diagnóstico →
dataroom → landing pública) con la caída por paso — el KPI interno más accionable.

**Notificaciones**: 2 casos nuevos (sin diagnóstico teniendo organización; convocatoria
que cierra en ≤15 días).

✅ **El match de fondos ahora es EXACTO** (2026-07-18, backend `a5bfd0e`, frontend `d30ba8f`):
taxonomía EYWA de **17 temas** (`lib/sector-tags.ts`), campo `funds.sector_tags`, los 146
fondos etiquetados por clasificador (`scratchpad/tag_funds.py`) desde el texto libre — que
se conserva en `sectors` para trazabilidad. Cada industria de empresa mapea a sus temas;
los fondos `multisectorial` aplican a todos. UI: chips de tema (verde = coincide contigo),
filtro por tema, banner "N fondos encajan con tu industria" y edición de temas en el CRUD.
⚠️ **Gotcha encontrado:** `organizations.sector` admite **texto libre** y en prod había
valores en español ("Energía Renovable") que no están en la lista inglesa `INDUSTRY_SECTORS`
→ el match daba 0. Se resolvió con normalización (sin tildes/mayúsculas), alias en español
y coincidencia parcial. **Si se agregan sectores nuevos, revisar `SPANISH_ALIASES`.**
✅ **Clasificador v2 (2026-07-18, `c326b4f`)**: de **14 → 5** fondos sin tema específico, y
esos 5 SÍ son transversales (uno dice literalmente "Multisectorial."). Tres correcciones:
1. **Audiencia ≠ tema**: `eligible_profile` dice *quién puede postular*, no de qué trata el
   fondo. Usarlo siempre metía ruido ("admite ONGs" → gobernanza). Ahora `sectors`+`name`
   son la señal primaria y el perfil solo es **fallback** cuando no hay señal temática.
2. **Falsos positivos por substring**: "agri**cultura**" activaba el tema cultura y
   "mater**ia**" el de tecnología. Ahora las claves usan **límite de palabra** (con sufijo
   libre a propósito: "climat" → climático). `tecnologia` bajó de 60 a 32 al quitar el ruido.
3. Se quitó "creativ" de cultura ("Creative Destruction Lab" es una aceleradora tech) y
   "agentes" de tecnología ("agentes de cambio" son personas).
+ Tema nuevo **`cultura`** (Cultura y creatividad). El gestor puede afinar desde la UI.

✅ **Landing — RESUELTO (2026-07-18, backend `eb169d8`, frontend `799f801`)**: fuera
"Ecosistemas Conectados / Puntos de Datos por Día / Millones USD Gestionados" (los tres
mostraban "Pendiente"). Ahora: **actores del ecosistema** y **oportunidades de
financiamiento** desde `GET /api/stats/public` (endpoint público, solo conteos agregados,
nunca nombres) + **14 criterios ESG · metodología GENES**. Si la API no responde muestra
"—", nunca un número inventado.
Nota de criterio: NO se muestran "empresas registradas" ni "diagnósticos realizados"
porque con 2 y 1 restarían credibilidad. Cuando haya tracción, se cambian por esos
(los datos ya están en el endpoint).

### ✅ Control y auditoría (superadmin) — CONSTRUIDO (2026-07-26, backend `de40a87`, frontend `e7899af`)
`GET /api/users/audit` (**solo superadmin**, verificado: user/gestor/admin → 403).
Panel `AuditPanel.tsx` en Super Administración con tres pestañas:
1. **Usuarios** — rol, plan, organización, última sesión y último cambio de clave.
2. **Descargas** — bitácora **GLOBAL** del dataroom (el dueño ve la suya; el
   superadmin ve la de todas las empresas).
3. **Accesos externos** — invitados sin cuenta que **ahora mismo** pueden abrir el
   dataroom completo de alguna empresa. El dato más sensible del panel.
Más resumen: usuarios, equipo interno, nunca ingresaron, recuperaciones vivas.

⚠️ **La plataforma NO guardaba estos dos datos.** Se agregaron `last_login_at` y
`password_changed_at` a `profiles` y se conectaron en los 4 puntos donde ocurren:
`/auth/validate` (el login real de la app), `/auth/login`, `/auth/reset-password` y
el cambio desde Configuración. **Van aparte de `updated_at`** a propósito: ese
cambia con cualquier edición del perfil (avatar, plan, rol) y no puede responder
"¿cuándo entró?" ni "¿cuándo cambió su clave?".

**Se dejan NULL para las cuentas anteriores** al 2026-07-26. Rellenarlas con
`created_at` sería inventar un dato justo en el panel donde más importa que sea
cierto; la respuesta trae `tracking_since` y la UI muestra "Sin registro" con el
aviso de desde cuándo se mide.

El registro de la última sesión **nunca bloquea el login**: si el UPDATE falla se
loguea el error y el usuario entra igual.

Verificado con una cuenta desechable (creada, usada y borrada): antes de entrar
ambos campos NULL → tras `/auth/validate` se escribió `last_login_at` → tras
cambiar la clave se escribió `password_changed_at`.

### ✅ Visitas a la web — CONSTRUIDO (2026-07-25, backend `9e4f436`, frontend `8864586`)
Tabla `site_visits` + `POST /api/stats/visit` (público) + `GET /api/stats/visits`.
**Exclusivo de SUPERADMIN** (decisión del usuario): panel en Super Administración
(`VisitsPanel.tsx`), con rangos 7/30/90 días, barras por día, páginas más vistas y de
dónde llegan. `VisitTracker` en el layout dispara en cada cambio de ruta (verificado:
2 POSTs al navegar entre 2 rutas).
Restricción verificada en producción con tokens reales de cada rol:
`user 403 · gestor 403 · admin 403 · superadmin 200`. La regla vive en el **backend**
(`assertRole(user, ['superadmin'])`), no solo en la UI: ocultar el panel no impediría
que otro rol llamara al endpoint a mano.

**Privacidad por diseño (sin cookies, sin banner de consentimiento):**
- **No se guarda la IP ni el user-agent en claro.** Se guarda un hash de
  (IP + UA + día + `AUTH_SECRET`). Verificado en BD: 0 filas contienen la IP enviada.
- Como la **fecha entra en la mezcla, el hash rota cada día** → los "únicos" son
  únicos POR DÍA y nadie puede ser seguido en el tiempo.
- **La ruta se guarda sin query string.** Probado con
  `/restablecer?token=SECRETO`: se guardó `/restablecer`, 0 filas con el token.
- Del **referrer solo el dominio** (`www.google.com`), nunca la URL completa.
- Los **bots se cuentan aparte** (`is_bot`), no dentro de "visitas": si un crawler
  pasa 300 veces, el número dejaría de significar personas.

⚠️ **El proxy DEBE reenviar `x-forwarded-for`.** Sin eso el backend ve la IP del
servidor de Vercel y **todas** las visitas comparten hash → "1 visitante único" para
siempre. Está en `app/api/proxy/stats/visit/route.ts`.
⚠️ El conteo **empieza desde el despliegue**; no hay datos históricos porque antes
no se medía. El panel lo dice explícitamente en vez de mostrar 0 sin contexto.

### ✅ Trust Score del dashboard: hablaba una escala que no era GENES (2026-07-25)
`HeroDashboard` mostraba "53 de 75 puntos" (GENES) pero lo etiquetaba **"Nivel: Bueno"**
y **"Certificación Silver Seal"**, que salían de `getScoreLevel`/`getSealLabel`
(umbrales 80/60/40, ajenos a GENES). El mismo puntaje era **Oro** en el Diagnóstico y
**Silver** aquí — dos metales para el mismo dato. Ahora usa la categoría GENES con el
badge compartido. Se retiró "Certificación" (prometía un sello que nadie emite) y se
sustituyó por **"autoevaluación"**, que es lo que realmente es.
⚠️ `getScoreLevel`/`getSealLabel`/`SEAL_LABELS` quedan en `constants/scoring.ts` **sin
usar**: son la escala vieja. Borrarlos cuando se confirme que nada más los necesita.

**Sigue pendiente (necesita captura nueva, no cálculo):**
- `InvestorPortfolio`: Valor Total y Carbono → requieren valorizaciones y emisiones.
- **Módulo de huella de carbono**: el único que desbloquearía "carbono capturado" de
  verdad. Es un módulo nuevo, no un KPI.

### ✅ Diagnóstico ESG — MOTOR GENES CONSTRUIDO (2026-07-15)
Motor ponderado GENES en producción: 4 categorías, 14 criterios, pesos suman 1.0,
escala 0-5 → 0-75, bandas (No cumple/Mínimamente/Parcialmente/Plenamente). **Verificado**:
API expone weight/category; fórmula da 75/45/0 para todo-5/todo-3/todo-0; POST /results
persiste categoría y banda. Cálculo es client-side (`DiagnosticInterface`); backend guarda.
Opciones **adecuadas por criterio** (2026-07-15): binarias donde aplica (RUC: Sí/En trámite/No;
CEO mujer), rangos de % (inclusión laboral: >50%/26-50%/…/0%) y escala de madurez donde hay
espectro. 53 opciones, puntos GENES 0-5, pesos siguen sumando 1.0 (máximo = 75). Aplicado a prod.
**Pendiente menor:** (a) ~~validación de Eduardo~~ → ✅ APROBADO (2026-07-16): Eduardo dio
el visto bueno a la redacción de las 53 opciones — el contenido del diagnóstico queda SELLADO;
(b) ~~desglose por categoría~~ → RESUELTO 2026-07-16 en TODAS las vistas: `EsgIndexPanel`
(Mi Organización), pantalla "ya completado" y la pantalla de RESULTADOS del test (barras
por categoría + criterios agrupados). Además: **informe PDF descargable real** (jsPDF,
`lib/diagnostic-pdf.ts`), fix del badge de banda (clases Tailwind dinámicas purgadas) y
"Próximos Pasos" honesto (fuera el "informe en 48 horas" falso). `11f3d1f`.
Fuente: `Proceso_ESG/CUADRO FINAL GENES...`.

### ✅ Índice ESG = diagnóstico + imágenes de perfil (2026-07-16, DESPLEGADO)
**Decisión del usuario: "El diagnóstico ES el índice".** `EsgIndexPanel.tsx` reemplazó al
`EsgDashboard` manual (15 indicadores editables) en Mi Organización → el índice sale del
último resultado GENES: nota global 0-5 (= score/15), % de cumplimiento, banda, desglose
por las 4 categorías (promedio 0-5 del breakdown), CTA al diagnóstico si no hay resultado.
Se eliminó "Editar valores". **Código muerto a limpiar:** `EsgDashboard.tsx`, `EsgRepository`,
rutas `/api/esg` + `/api/proxy/esg`, modelos `EsgScore`/`EsgHistory` (verificar huérfanos).

**Imágenes (ambas, decisión del usuario):** logo de organización + avatar de usuario.
- BD: `organizations.image_url`, `profiles.avatar_url` (migración `20260716120000_media_images`, aplicada).
- Backend `/api/media`: POST autenticado (multipart, 5 MB, PNG/JPG/WebP) al volumen VPS
  `/home/kaqui/eywa-uploads` (el del Dataroom; entra al backup); GET **público** para servir
  (un `<img>` no envía Authorization; el logo se ve en la mini-landing). Borra la imagen
  anterior del disco al reemplazar.
- Frontend: `ImageUploader.tsx` reutilizable; logo en Mi Organización → Perfil y en
  `/empresa/[slug]` (el public/:slug ahora expone `id` + `has_logo`); avatar en Configuración
  y en la barra lateral (fallback a ícono si 404).
- Deploys: backend `c37ea8b`, frontend `bae1631`. Verificado por API (404/401 correctos,
  volumen montado); falta smoke test con sesión (subir imagen real desde la UI).

### ✅ Notificaciones reales (2026-07-16, DESPLEGADO) — arquitectura derivada del estado
Antes era cascarón: panel "en desarrollo" + badge "3" hardcodeado. Ahora:
`GET /api/notifications` calcula los avisos del usuario **al momento** (sin tabla) —
se autoresuelven al completar la acción, no hay "marcar como leída". `NotificationsPanel`
con CTA que navega; badge del nav con conteo real (se refresca al cambiar de vista).
- **Caso 1 (activo):** registro incompleto — usuario sin Mi Organización completada
  (menciona la empresa declarada al registrarse, ej. BANKCOIN) → CTA "Completar Mi Organización".
- **Casos futuros (el usuario los irá definiendo):** se suman como bloques en la misma
  ruta. Candidatos naturales: sin diagnóstico ESG, dataroom incompleto, fondo por cerrar
  que matchea el sector, curso empezado sin terminar. Si algún caso futuro es de EVENTO
  (no de estado), ahí sí tocará tabla + leída/no-leída.
El mismo caso también se ve en el Portfolio como badge ámbar "Registro incompleto"
(profiles con company pero sin organización entran al listado con todo "Pendiente").

### ✅ Portfolio híbrido (2026-07-16, DESPLEGADO) — "las empresas del portafolio son las vinculadas a un usuario"
**Corrección + decisión del usuario:** el Portfolio se alimenta de las ORGANIZACIONES
reales (empresas de usuarios) en modo **híbrido** (el gestor puede además agregar
empresas EXTERNAS a mano), y las columnas salen del **diagnóstico GENES**.
- `GET /api/portfolio` = unión: `organizations` (score = % del último diagnóstico, banda,
  estado Diagnóstico realizado/pendiente, riesgo derivado: ≥61 bajo · ≥46 medio · <46 alto,
  logo + slug de mini-landing, `source=plataforma`) + `portfolio_companies`
  (`source=manual`, campos a mano del gestor).
- UI: badge **Verificada** (plataforma) vs **Externa** (manual); editar/eliminar SOLO
  externas ("vía su perfil" para las de plataforma); "Agregar Empresa Externa";
  score sin diagnóstico → "Pendiente"; fuera la paginación falsa "1-5 de 24".
- Las **5 empresas demo del seed se borraron de prod** (inventadas; backup CSV en
  `/tmp/portfolio_demo_backup_20260716.csv` del contenedor postgres_db).
- Deploys: backend `637c09d`, frontend `2d0af78`.
- Nota: esto acerca "Portafolio v2" (fuente de actores/empresas reales para
  Simbiocreación); la forma del "actor persona" sigue pendiente.

### 📎 Metodología GENES (referencia, recibida 2026-07-15)
Fuente: `C:\Users\Asus\Desktop\EYWA\Proceso_ESG\CUADRO FINAL GENES PERU V10.xlsx`.
**Decisiones del usuario (2026-07-15):** adoptar la metodología GENES (ponderada, 4
categorías, escala 0-5, bandas) + modo **autoevaluación** (la empresa elige).

**Rúbrica GENES = 4 categorías · 14 criterios · escala 0-5 · pesos suman 1.0:**
- **Perfil de Emprendimiento (0.34):** RUC legalizado (0.03) · CEO mujer (0.04) · Segmento
  de clientes identificado (0.07) · Potencial de crecimiento (0.10) · Sistema de M&E de impacto (0.10).
- **Ambiental (0.16):** Usa insumos sostenibles (0.10) · Mide huella ecológica (0.03) · Certificación ambiental (0.03).
- **Social (0.25):** Comercio justo/empleo local (0.08) · Oportunidad laboral mujeres/vulnerables (0.07) · Reconocimientos desarrollo humano (0.10).
- **Económico (0.25):** Economía circular (0.07) · Ha recibido apoyo financiero (0.03) · Viabilidad económica (0.15).

**Escala:** 5 supera · 4 cumple plenamente · 3 parcial · 2 mínimo · 0 no cumple. Valor = puntos × peso.

**⚠️ CATEGORÍAS ACTUALIZADAS (Eduardo, 2026-07-25) — sustituyen a las 4 bandas viejas:**
| Categoría | Rango (0-75) |
|-----------|--------------|
| **Marrón** | 0-15 |
| **Verde**  | 16-30 |
| **Plata**  | 31-45 |
| **Oro**    | 46-60 |
| **Fénix**  | 61-75 |

Cinco tramos iguales de 15 puntos. Los cortes 31/46/61 se conservan del esquema
anterior y el antiguo 0-30 ("No cumple") se parte en Marrón y Verde. El score NO
cambia, solo la etiqueta. Backend `7de005b`, frontend `3799d5c`; migración
`20260725160000_genes_categories` reclasificó lo ya guardado (1 fila: 53 → Oro).

**Fuente única:** `eywa_api/src/lib/scoring.ts` y `eywa_claude/src/lib/constants/scoring.ts`
(`getGenesBand` + `getGenesBandClasses`). Antes los umbrales y colores estaban copiados
a mano en 4 componentes — si hay que cambiar cortes o paleta, se toca SOLO ahí.
Colores medidos en navegador: las 5 pasan WCAG AA (la más ajustada 4.72:1). Fénix es el
único badge relleno (`bg-orange-700 text-white`) porque naranja-500/600 con texto blanco
no llegaban a AA (2.89:1 y 3.58:1) y además el nivel más alto salía más pálido que Oro.

~~**Bandas anteriores:** 0-30 No cumple · 31-45 Mínimamente · 46-60 Parcialmente · 61-75 Plenamente.~~
Trae también tabla de referencia de los 17 ODS.

**⚠️ PRIVACIDAD:** las hojas `data` y `RESPUESTAS` tienen PII de empresas reales (contactos,
correos, RUC, respuestas de la cohorte GENES). **Solo la metodología** se usa; los datos de
esas empresas son confidenciales de terceros → NO cargar ni exponer.

~~**Gap con el motor actual (requiere migración)**~~ → RESUELTO: `weight`+`category`
migrados, scoring ponderado y bandas en prod (2026-07-15). El dilema "4 categorías GENES vs
5 del radar EsgDashboard" se resolvió el 2026-07-16 eliminando el radar manual: el índice
ESG ahora ES el diagnóstico (ver sección Índice ESG más arriba).

**Contenido pendiente de validar con Eduardo:** el Excel da la escala GENÉRICA (mismos 5
niveles para todos) + las preguntas del formulario de admisión, pero NO una redacción por
nivel específica de cada criterio. Al construir la autoevaluación hay que redactar las 5
opciones por criterio (borrador derivado de GENES + formulario) → validar con Eduardo antes
de cargar (no inventar puntajes; la escala 0-5 y los pesos SÍ son oficiales del Excel).

**Plan de build:** 1) schema `weight`+`category` + migración. 2) scoring ponderado + bandas.
3) seed de los 14 criterios (opciones = escala GENES; descripción = pregunta del formulario).
4) frontend: agrupar por categoría + mostrar % ponderado + banda. 5) limpiar los 3 placeholders.

### 🟠 Contenido del diagnóstico ESG — preparación (2026-07-10, superado por lo de arriba)
**Decisiones tomadas:** el contenido lo pasan el usuario/Eduardo; **la estructura
(plana vs mapeada a las 5 dimensiones) queda pendiente de analizar un Excel** que
Eduardo tiene. Cuando llegue el Excel → lo audito y defino estructura + cargo.

**Motor actual (auditado):**
- Modelo: `DiagnosticQuestion` (title, description, context_title/description/impact/image,
  sort_order) + `DiagnosticOption` (label, value, score, sort_order) + `DiagnosticResult`
  (score, maxScore, percentage, level, breakdown por pregunta).
- Scoring: `total = Σ(score de opción elegida)` / `max = Σ(mejor opción por pregunta)`;
  `%` = total/max. Niveles: Inicial <40, Moderado 40-59, Bueno 60-79, Excelente ≥80.
- **No hay campo `dimension`** en las preguntas → hoy el diagnóstico da UN score plano.
- Hay **3 preguntas placeholder** (Certif. Orgánica, Carbono, Gobernanza Social) y
  4 resultados de prueba → limpiar al cargar el contenido real.

**Existe aparte** un panel ESG de **5 dimensiones × 3 = 15 indicadores** (`EsgDashboard`,
data-driven vía `EsgRepository`): Ambiental (Emisiones/Energía/Agua), Social (Comunidad/
Empleados/Seguridad), Gobernanza (Cumplimiento/Transparencia/Ética), Innovación (Tec.Verde/
I+D/Capacitación), Cadena de Valor (Materiales/Logística/Proveedores). **Hoy NO se conecta
con el diagnóstico.** Si el Excel confirma estructura mapeada → agregar `dimension` (+ opcional
`indicator`) a la pregunta, scoring por dimensión, y alimentar el radar con el resultado.

**Contrato de datos por pregunta (lo que hay que llenar):**
| Campo | Obligatorio | Nota |
|-------|-------------|------|
| `sort_order` | sí | orden de aparición |
| `title` | sí | la pregunta |
| `description` | sí | subtítulo/ayuda |
| `context_title/description/impact` | opcional | contexto educativo que se muestra |
| `dimension` | según Excel | Ambiental/Social/Gobernanza/Innovación/Cadena (si mapeado) |
| **opciones** (2-5) | sí | cada una: `label`, `value` (slug), `score` (int), `sort_order` |

**Al recibir el Excel:** mapear columnas → contrato, decidir estructura, generar seed SQL
(idempotente, estilo `seed-demo-course.sql`), limpiar placeholders y cargar en la BD.

---

## Hecho recientemente

| Fecha | Qué | Commit |
|-------|-----|--------|
| 2026-07-10 | Directorio de Actores: modelo + rutas (PII por rol) + 320 actores importados de NAB PE/CO (Fases 1-2) | (backend) |
| 2026-07-10 | Validador: flujo desacoplado crear/analizar, heurístico etiquetado "preliminar", pestaña Reportes, fuera promesa "24-48h" y botón Exportar muerto | (frontend) |
| 2026-07-10 | Link compartir de Simbiocreación: visor público `/simbio/[id]` + endpoint público (privadas→404). Verificado en vivo sin sesión | `8382b48` |
| 2026-07-10 | Simbiocreación: panel de grupos honesto (fuera niveles/chevrons/botón muerto), "ideas"→"grupos", y "Nuevo grupo" vuelve a insertar el nodo en el grafo guardado | `24684db` |
| 2026-07-10 | Simbiocreación: el grafo nunca persistía (`graphData` descartado por Zod); `PATCH`/`DELETE` devolvían falso éxito | `fe38bfc` |
| 2026-07-10 | `/login` no devolvía `name` → perfil y certificado caían al email | `4be7e61` |
| 2026-07-09 | Auto-deploy del backend por GitHub Actions (push a `master` → VPS) | `ca20324` |
| 2026-07-09 | Academia: secciones, examen final (umbral 80%), certificados PDF verificables + curso demo | `ea93156` |
| 2026-06-27 | Validador de Proyectos conectado a API real (heurístico) | `e92677f` |

---

## Descartado

| Qué | Motivo |
|-----|--------|
| Caja de comentarios en Simbiocreación | Sin `value`/`onChange`/botón ni modelo `Comment`. Prometía guardar y no guardaba. Retirada; la feature sigue viva arriba. |
| "Nivel 1 / Nivel 2" en el panel de grupos | "Nivel 1" era siempre el nombre de la simbiocreación (misma cadena repetida en cada fila). "Nivel 2" repartía los tags de dos en dos por posición (`cats[Math.floor(i/2)]`) e inventaba "Cat 1"/"Cat 2" — que ni coincidían con las 3 categorías del grafo. Jerarquía inexistente. |
| Chevrons `<` `>` del panel de grupos | Texto decorativo, no enlaces. Con `flex-wrap` se descolgaban en líneas sueltas. |
| Botón "Añadir participante" (icono de personas) | `<button>` sin `onClick`. |
| Open Graph / preview por cada `/simbio/[id]` | Decisión del usuario (2026-07-10): no se hará. El enlace funciona; solo no tendrá tarjeta enriquecida al pegarlo en WhatsApp/LinkedIn. |
