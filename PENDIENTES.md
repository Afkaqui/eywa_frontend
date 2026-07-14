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
- Elegir backend de storage. Opciones:
  - **Cloudflare R2** (S3-compatible, sin egress) — recomendado si se prevé volumen.
  - **Disco del VPS** + carpeta servida por el backend — más simple, sin costo extra,
    pero acopla los archivos al servidor (backup/espacio propios).
  - S3/Supabase Storage — alternativas válidas.
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
   Cableado en nav + page. Pendiente menor: **UI de CRUD admin** (crear/editar actores;
   el backend ya lo soporta, falta la interfaz).
4. ⬜ **Portafolio**: `PortfolioCompany.actorId?` (link) + acción "agregar a mi portafolio".
   - ⬜ **Apartado de "Fondos"** dentro de Portafolio (pedido por el usuario 2026-07-13):
     sección dedicada a fondos de inversión. Probable origen: actores con categoría
     `proveedores_capital` (fondos de inversión de impacto, gestoras, etc.). Definir si
     es una vista filtrada del directorio o un concepto propio del portafolio.
5. ⬜ **Simbiocreación**: actores como nodos "institución" del grafo (nodo lleva `actorId`).
   Conecta con el Panel de Actores (§1).

**Abierto:** confirmar el mapeo fino de subcategorías/sectores/instrumentos al importar
(algunos textos de los Excel vienen con espacios/variantes).

---

## 6. Seguridad / infraestructura

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

### 🟠 Contenido del diagnóstico ESG — preparación (2026-07-10)
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
