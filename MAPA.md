# 🗺️ MAPA DEL PROYECTO EYWA

> Mapa de arquitectura para orientarse rápido: qué hay, dónde vive y por qué está así.
> Complementa a los otros dos documentos vivos:
> - **`PENDIENTES.md`** → qué falta y qué se decidió (registro vivo, manda sobre todo lo demás)
> - **`IDENTIDAD.md`** → cómo se ve y se escribe (identidad visual y de tono)
>
> Última actualización: **2026-07-18**

---

## 1. Qué es EYWA

Plataforma SaaS de **orquestación ecosistémica y sostenibilidad**. Una empresa entra,
se autoevalúa con una metodología real (GENES Perú), obtiene un **índice ESG trazable**,
ordena su documentación en un **dataroom** y queda visible ante **inversionistas** y
**fondos** de financiamiento. Modelo freemium (Premium = $20/mes).

**Regla de producto que atraviesa todo:** *honestidad radical*. Si un dato no existe se
muestra **"Pendiente"**, no se inventa. Si una UI no tiene backend, se retira. No hay
cascarones que prometan lo que la app no hace.

---

## 2. Arquitectura

```
Navegador
   │  cookie de sesión (NextAuth)
   ▼
Vercel · Next.js 15 (frontend + rutas /api/proxy/*)
   │  el proxy inyecta el JWT como Bearer  ← el token NUNCA vive en el cliente
   ▼
VPS 161.132.54.226:4001 · Hono.js en Docker (contenedor eywa_api)
   ▼
PostgreSQL 16 (contenedor postgres_db, bind 127.0.0.1) + disco ~/eywa-uploads
```

| Capa | Tecnología | Repo / ubicación |
|---|---|---|
| Frontend | Next.js 15 · React · TypeScript · Tailwind | `Afkaqui/eywa_frontend` (`main`) · local `eywa_claude` |
| Backend | Hono.js · Prisma · Zod | `Afkaqui/eywa_backend` (`master`) · local `eywa_api` |
| BD | PostgreSQL 16 en Docker | VPS, DB `eywa_db`, user `admin` |
| Archivos | Disco del VPS | `~/eywa-uploads` → `/app/uploads` en el contenedor |

**Por qué el patrón proxy:** el navegador nunca habla directo con el backend. Cada ruta
`/api/proxy/*` lee la cookie de sesión, la cambia por el `Bearer` y reenvía. Evita CORS,
oculta el token y permite validar en el borde.

### Despliegue
- **Frontend:** push a `main` → Vercel despliega solo (~1–2 min).
- **Backend:** push a `master` → GitHub Actions → recrea el contenedor en el VPS (~2–3 min).
- **Migraciones:** se aplican **a mano** contra la BD de producción
  (`ssh … "docker exec -i postgres_db psql -U admin -d eywa_db" < migration.sql`).
  Se escriben idempotentes (`IF NOT EXISTS`) porque se corren a mano.

---

## 3. Módulos y dónde viven

| Módulo | Frontend | Backend | Tablas |
|---|---|---|---|
| **Diagnóstico ESG** | `DiagnosticInterface`, `DiagnosticCompleted`, `lib/diagnostic-pdf.ts` | `routes/diagnostic.ts` | `diagnostic_questions/options/results` |
| **Índice ESG** | `EsgIndexPanel` (+ gráfico de evolución) | *(usa diagnostic)* | `diagnostic_results` |
| **Mi Organización** | `OrganizationProfile` | `routes/organization.ts` | `organizations` |
| **Dataroom** | `Dataroom` | `routes/dataroom.ts` | `dataroom_folders/items/documents/access_grants/access_logs` |
| **Mini-landing pública** | `app/empresa/[slug]` | `dataroom.ts` (`/public/:slug`) | — |
| **Portfolio** | `InvestorPortfolio` | `routes/portfolio.ts` | `organizations` + `portfolio_companies` |
| **Directorio de Actores** | `ActorsDirectory` | `routes/actors.ts` | `actors`, `actor_favorites` |
| **Fondos** | `FundsDirectory` | `routes/funds.ts` | `funds` |
| **Academia** | `EdutechDashboard`, `CourseViewer`, `lib/certificate-pdf.ts` | `routes/courses.ts`, `certificates.ts` | `courses`, `course_sections`, `section_resources/progress`, `exam_questions/attempts`, `course_enrollments`, `certificates` |
| **Verificación de certificados** | `app/verificar/[[...code]]` (pública) | `certificates.ts` (`/verify/:code`) | `certificates` |
| **Simbiocreación** | `SimbiocreacionDashboard`, `app/simbio/[id]` | `routes/simbiocreacion.ts` | `simbiocreaciones` |
| **Validador de Proyectos** | `ValidadorProyectos` | `routes/validator.ts` | `project_plans`, `plan_documents` |
| **Notificaciones** | `NotificationsPanel` | `routes/notifications.ts` | *(ninguna: se derivan del estado)* |
| **Imágenes** | `ImageUploader` | `routes/media.ts` | *(campos en `organizations`/`profiles`)* |
| **Auth y roles** | `LoginPage`, `SettingsDashboard`, `contexts/AuthContext` | `routes/auth.ts`, `users.ts` | `profiles` |
| **Paneles por rol** | `GestorDashboard`, `AdminDashboard`, `SuperAdminDashboard` | *(varios)* | — |

### Páginas públicas (sin sesión)
`/` (landing) · `/fase1` (resumen del MVP) · `/empresa/[slug]` (mini-landing) ·
`/simbio/[id]` (visor de grafo) · `/verificar/[código]` (certificados) · `/docs`

---

## 4. El flujo que conecta todo

```
Registro → Mi Organización → Diagnóstico GENES
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
        Índice ESG           Portfolio           Dataroom
     (Mi Organización)   (ante inversores)   (ítem ASG auto)
```

**Un solo diagnóstico alimenta tres vistas.** Ese es el corazón del producto: el dato
se captura una vez, con metodología, y se propaga. Rehacer el diagnóstico actualiza
todo automáticamente.

---

## 5. Roles y permisos

| Rol | Puede |
|---|---|
| `user` | Su organización, su diagnóstico, su dataroom, sus proyectos, favoritos de actores. Fondos solo si es Premium. |
| `gestor` | Todo lo anterior + CRUD de portfolio (empresas externas), preguntas del diagnóstico, **fondos** y **actores**. Ve datarooms **delegados** (solo lectura) y la PII de actores. |
| `admin` | Lo de gestor + gestión de usuarios. |
| `superadmin` | Todo, incluido delegar datarooms a gestores. |

**Reglas de datos sensibles:**
- La **PII de actores** (contacto, correo) solo se serializa para gestor+. Nunca sale al cliente de un usuario normal.
- Todo documento del dataroom **nace privado**; publicar es explícito y por documento.
- El **plan** (free/premium) se verifica **contra la BD**, no contra el JWT (que puede quedar viejo tras un upgrade).

---

## 6. Modelo de datos (28 tablas)

**Núcleo:** `profiles` → `organizations` (1:1) → todo lo demás cuelga de ahí.

Agrupadas por módulo: *Diagnóstico* (3) · *Dataroom* (5) · *Academia* (8) ·
*Actores* (2) · *Validador* (2) · *Portfolio* (1) · *Fondos* (1) · *Simbiocreación* (1) ·
*Auth* (1) · *Prisma* (1).

⚠️ **`esg_scores` y `esg_history` están DEPRECADAS** (2026-07-16). Son del panel ESG
manual de 15 indicadores que se reemplazó por el diagnóstico. El código ya se borró;
las tablas se conservan porque tienen datos y dropear es irreversible. Llevan
`COMMENT` en la BD. **No construir nada encima.**

---

## 7. Convenciones y gotchas

**Aprendidos a golpes — leer antes de tocar:**

- **Prisma `@default(uuid())` y `@updatedAt` son de capa APP, no de BD.** Un `INSERT`
  SQL directo debe poner `gen_random_uuid()` y `NOW()` a mano o falla por NOT NULL.
- **Para limpiar un campo `Json?` en Prisma se pasa `Prisma.DbNull`**, no `null`.
- **Clases Tailwind dinámicas se purgan en el build.** `bg-${color}-100` sale sin
  estilo en producción. Siempre clases completas.
- **El backend serializa camelCase; el frontend usa snake_case.** La normalización
  se hace **una sola vez en el repository**, no en los componentes (fue la causa de
  dos crashes: diagnóstico y cursos).
- **Los seeds de `actors` y `funds` son destructivos** (`DELETE FROM`). Si llega una
  fuente actualizada, **fusionar**, no reemplazar, o se pierde lo agregado desde la UI.
- **El volumen `~/eywa-uploads` es imprescindible**: el auto-deploy recrea el
  contenedor y sin él los archivos se perderían en cada push. Está en los backups.
- **El VPS es compartido** (~27 contenedores de otros proyectos). Cuidado con puertos,
  espacio en disco y `docker` masivo.
- **Docker-Snap/AppArmor**: al recrear contenedores a veces da "permission denied";
  el workaround está en `~/GUIA_VPS.md` del VPS.

---

## 8. Estado y deuda conocida

**En producción y funcionando:** diagnóstico GENES (14 criterios ponderados) ·
índice ESG con evolución histórica · dataroom (10 carpetas/50 docs, delegación,
bitácora) · mini-landing · portfolio híbrido · 320 actores · 146 fondos ·
academia con examen y certificados verificables · validador con documentos reales ·
notificaciones derivadas del estado.

**Bloqueado por externos:** correo (dominio + Resend → recuperación de contraseña e
invitaciones) · **HTTPS de la API** (hoy va por HTTP plano en el 4001, expuesto) ·
IA del validador (credenciales de ARS) · contenido de 6 cursos (plantilla Excel
entregada) · logo definitivo.

**El detalle completo y actualizado siempre está en `PENDIENTES.md`.**
