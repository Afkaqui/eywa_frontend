# EYWA — Plan de pendientes

> Registro vivo de lo proyectado, lo incompleto y lo que quedó fuera de alcance.
> **Regla:** todo lo que se proyecte se anota aquí. Cuando algo se implementa, se
> mueve a *Hecho* con su commit. Cuando se descarta, se anota por qué.
>
> Última actualización: 2026-07-10

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

### 🟡 El grafo auto-generado inventa participantes
Cuando no hay grafo personalizado, `buildGraph` dibuja **siempre 2 nodos tipo `person`**
por grupo, con etiqueta `●` y sin usuario asociado. Si no hay tags, inventa además 2
grupos vacíos (`G1`, `G2`). Una simbiocreación vacía se ve poblada de gente que no existe,
y la pestaña *Participantes* de Búsquedas lista esos mismos puntos.

El modo edición **sí** permite vincular un usuario real a un nodo (`updateNodeUserId`),
así que el concepto existe — lo que falta es dejar de fingirlo en el auto-generado.

### 🟡 Dos fórmulas distintas de "puntaje"
- Backend (`/ranking`): `nº simbiocreaciones × 10`
- Frontend (StatCard local): `nº simbiocreaciones × 10 + nº grupos × 5`

El mismo usuario ve **dos puntajes diferentes** según la pantalla. Hay que unificar
en cuanto se defina la fórmula real (abajo).

### 🟡 El ranking usa un puntaje sintético
`puntaje = nº de simbiocreaciones × 10`. No mide calidad, colaboración ni impacto:
crear 10 simbiocreaciones vacías puntúa más que una con 50 participantes y 8 ODS.
**Falta definir la fórmula real** con negocio (¿participantes? ¿ODS cubiertos?
¿actividad reciente?). Hasta entonces el ranking premia el volumen.

### 🟡 `/public` y `/ranking` exigen token
Se llaman "públicos" pero están detrás de `authMiddleware` (responden 401 sin sesión).
Sirven para la pestaña *Explora* dentro de la app, pero **no permiten compartir una
simbiocreación hacia afuera**. Si se quiere compartir, hay que sacarlos del middleware
y decidir qué campos se exponen sin sesión.

---

## 2. Academia

### 🟠 Página pública de verificación de certificados
El backend ya expone `GET /api/certificates/verify/:code` **sin autenticación** y
devuelve titular, curso, nota y fecha. **No existe UI ni ruta proxy**, así que hoy
solo se puede verificar con `curl`. El certificado PDF imprime el código pero nadie
puede comprobarlo desde el navegador.

Falta: página `/verificar/[codigo]` (pública, sin login) + enlace en el PDF.

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

### 🔴 Recuperación de contraseña — *cascarón activo*
En `LoginPage.tsx` hay un botón **"¿Olvidaste tu contraseña?"** sin `onClick`.
No hace nada al pulsarlo. **Un usuario que pierda su contraseña no tiene forma de
recuperarla.**

Falta: tabla de tokens de reseteo, endpoints de solicitud/confirmación, envío de
correo (Resend + dominio verificado) y las dos pantallas. Depende de tener el dominio
de correo configurado.

> Nota: es el mismo patrón que los comentarios de Simbiocreación. Se mantiene visible
> por ahora porque el flujo de recuperación **sí está en el roadmap de Fase 1**; si se
> pospone, conviene retirar el botón.

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

### 🔴 Enchufar la API de IA real (depende de ARS)
Hoy corre con un **heurístico determinista**, no con IA. El *seam* ya está listo en
`validator-service.ts`: si existen `VALIDATOR_AI_URL` y `VALIDATOR_AI_KEY` en el
`.env`, usa IA real (formato compatible con OpenAI); si no, cae al heurístico.
**Verificado: en el VPS no están configuradas.** Falta que ARS entregue credenciales
y confirmar el contrato de su API.

### 🟠 Subida real de documentos con almacenamiento — plan de trabajo (B(b))
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
   Pendiente menor: **UI de CRUD admin** (crear/editar; el backend ya lo soporta).
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
     Pendiente menor: CRUD de fondos para el gestor (hoy el catálogo se actualiza re-corriendo
     el importador) y re-import periódico cuando Neo actualice la matriz.
5. ⬜ **Simbiocreación**: actores como nodos "institución" del grafo (nodo lleva `actorId`).
   Conecta con el Panel de Actores (§1).

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
1. ⬜ **Mini-landing pública** `/empresa/[slug]` — el `is_public` por documento ya existe y
   se puede alternar desde la UI, pero **la página pública aún no está hecha**, así que
   marcar "público" todavía no publica nada en ninguna parte.
2. ⬜ **Invitaciones** (inversores/auditores) → **bloqueado por el correo** (Resend + dominio),
   misma dependencia que recuperar contraseña (§3).
3. ⬜ **Permiso delegado a gestores** (`DataroomAccessGrant`): hoy solo el dueño y el
   **superadmin** acceden. El gestor todavía no.
4. ⬜ *(sugerido)* Registro de accesos (quién vio qué documento y cuándo).
5. ⬜ Auto-poblar la carpeta 7 (Sostenibilidad y ASG) desde el diagnóstico ESG y los
   certificados de la Academia.
6. ⬜ Incluir `~/eywa-uploads` en los backups del VPS.

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

### 🟡 KPIs marcados como "Pendiente"
Por decisión de producto, cuando un dato no está mapeado a la base de datos se muestra
**"Pendiente"** en vez de inventar un número. Afecta a:
- `HeroDashboard`: Carbono Capturado, Reducción Gap IMI, Próxima Auditoría, Proyectos Activos.
- `InvestorPortfolio`: Valor Total y Carbono.
- `HomePage` (landing): Ecosistemas, Puntos/día, USD gestionados.

Falta **definir el origen de cada métrica** antes de poder calcularlas.

### ✅ Diagnóstico ESG — MOTOR GENES CONSTRUIDO (2026-07-15)
Motor ponderado GENES en producción: 4 categorías, 14 criterios, pesos suman 1.0,
escala 0-5 → 0-75, bandas (No cumple/Mínimamente/Parcialmente/Plenamente). **Verificado**:
API expone weight/category; fórmula da 75/45/0 para todo-5/todo-3/todo-0; POST /results
persiste categoría y banda. Cálculo es client-side (`DiagnosticInterface`); backend guarda.
Opciones **adecuadas por criterio** (2026-07-15): binarias donde aplica (RUC: Sí/En trámite/No;
CEO mujer), rangos de % (inclusión laboral: >50%/26-50%/…/0%) y escala de madurez donde hay
espectro. 53 opciones, puntos GENES 0-5, pesos siguen sumando 1.0 (máximo = 75). Aplicado a prod.
**Pendiente menor:** (a) que Eduardo valide/afine la redacción exacta de las opciones;
(b) ~~desglose por categoría~~ → RESUELTO 2026-07-16: `EsgIndexPanel` (Mi Organización →
Índice ESG) muestra índice 0-5, banda y las 4 categorías. Queda opcional: radar/desglose
también en la pantalla de resultados del propio diagnóstico. Fuente: `Proceso_ESG/CUADRO FINAL GENES...`.

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
**Bandas de clasificación:** 0-30 No cumple · 31-45 Mínimamente · 46-60 Parcialmente · 61-75 Plenamente.
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
