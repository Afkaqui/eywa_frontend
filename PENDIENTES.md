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
aparece en públicas. **Pendiente menor:** Open Graph / preview del enlace al pegarlo
en WhatsApp/LinkedIn (hoy el visor es client-side, sin metadata por-id).

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

### 🧭 Flujo objetivo (definido con el usuario, 2026-07-10)
El módulo se reorganiza en pasos **desacoplados**:
1. **Crear proyecto** con sus documentos y datos — paso independiente, sin analizar.
2. **Lista de proyectos**, cada uno con un botón **Analizar** al lado.
3. **Analizar queda PENDIENTE** (falta la IA de ARS). No debe fingir con el heurístico:
   el botón muestra estado "análisis con IA · próximamente", no ejecuta y presenta.
4. Al analizar (cuando exista IA) se **habilita el apartado de Reportes** por proyecto.

Estado actual vs objetivo:
- ✅ Backend **ya desacoplado**: `POST /plans` (crear) y `POST /plans/:id/analyze`
  (analizar) son rutas separadas; el modelo `ProjectPlan` ya tiene `documents`,
  `status`, `report`, `analyzedAt`.
- ❌ **Frontend acopla crear+analizar**: el botón dice "Crear y Analizar Proyecto" y
  al crear llama solo a `analyzePlan()`. **Cascarón activo:** el texto promete
  *"analizará tu proyecto en 24-48 horas"* — falso (ni hay IA ni hay 24-48h; corre
  un heurístico al instante y lo presenta como análisis).

Construible **ya** (sin IA): separar crear de analizar, botón "Analizar" en estado
pendiente honesto, apartado de Reportes (vacío hasta que haya análisis), y quitar la
promesa de "24-48 horas". Bloqueado: el análisis en sí (abajo) y los documentos reales.

### 🔴 Enchufar la API de IA real (depende de ARS)
Hoy corre con un **heurístico determinista**, no con IA. El *seam* ya está listo en
`validator-service.ts`: si existen `VALIDATOR_AI_URL` y `VALIDATOR_AI_KEY` en el
`.env`, usa IA real (formato compatible con OpenAI); si no, cae al heurístico.
**Verificado: en el VPS no están configuradas.** Falta que ARS entregue credenciales
y confirmar el contrato de su API.

### 🟠 Subir el contenido de los documentos
Hoy solo se guarda **metadata** del documento, no el archivo. Para que la IA analice
de verdad hace falta almacenamiento (S3, R2 o disco del VPS) y extracción de texto.

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

### 🟡 Contenido del diagnóstico ESG
Las preguntas y ponderaciones del diagnóstico dependen de contenido de negocio
(Eduardo). El motor ya funciona.

---

## Hecho recientemente

| Fecha | Qué | Commit |
|-------|-----|--------|
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
