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

### 🔴 Enlace "Link compartir" apunta al vacío — *pendiente de decisión*
El botón copia `https://eywa-hazel.vercel.app/?simbio=<id>`, pero **nadie lee el
parámetro `?simbio=`**: el enlace deja al destinatario en la landing. No hay error,
simplemente no pasa nada — y el que comparte no se entera. Además el dominio está
**hardcodeado** a Vercel.

Lo correcto es una ruta pública `/simbio/[id]` que renderice la simbiocreación
(si no es privada) sin exigir login, más un endpoint público `GET /api/simbiocreacion/:id`.
Necesita lo mismo que la verificación de certificados: **rutas públicas que hoy no existen**.
Mientras tanto el botón reparte enlaces rotos.

### 🟠 ¿Qué es una "idea"? — concepto sin definir
El panel llamaba "ideas" a los `tags` (lo que el formulario pide como *"Grupos / tags"*).
Se renombró todo a **"grupos"** para que un mismo dato no tenga dos nombres. Pero la
pregunta de producto sigue abierta: **¿una idea es un nodo del grafo, un tag, o una
entidad propia con autor y participantes?** Hasta definirlo, no hay jerarquía que construir.

Retirado del panel por ser andamiaje ficticio (ver *Descartado*): niveles fabricados,
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
