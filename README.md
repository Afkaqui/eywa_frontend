# EYWA — Plataforma de Sostenibilidad y Gestión de Impacto

> MVP Fase 1 en producción · eywa-hazel.vercel.app · mayo 2025

---

## ¿Qué es EYWA?

Plataforma digital integrada que acompaña a organizaciones en su camino hacia la sostenibilidad. Combina diagnóstico ESG, medición continua, colaboración visual, formación y gestión de portafolio en un único ecosistema.

**Presentación pública:** https://eywa-hazel.vercel.app/fase1

---

## Stack Técnico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | Next.js 15 · App Router · TypeScript · Tailwind CSS |
| **Backend** | Hono.js (Node) · REST API · JWT propio |
| **Base de datos** | PostgreSQL 16 · Prisma ORM |
| **Infraestructura** | VPS 161.132.54.226 · Docker Compose · Vercel (frontend) |
| **IA** | Claude API (Anthropic) — Validador de Proyectos |
| **Iconos** | Lucide React |

---

## Arquitectura

```
Frontend (Vercel)                Backend (VPS :4001)
Next.js 15                       Hono.js + Prisma
src/app/                         ~/eywa-backend/
  api/proxy/**  ──────────────►  /api/**
  page.tsx (SPA)                 PostgreSQL eywa_db
  resumen → /fase1               Docker: eywa_api
```

### Estructura del frontend

```
src/
├── app/
│   ├── page.tsx                     # SPA principal (navegación por estado)
│   ├── fase1/page.tsx               # Presentación pública Fase 1
│   ├── api/proxy/                   # Proxies al backend VPS
│   │   ├── simbiocreacion/
│   │   │   ├── route.ts             # CRUD simbiocreaciones
│   │   │   ├── [id]/route.ts        # GET/PATCH/DELETE por ID
│   │   │   ├── public/route.ts      # Simbios públicos (Explora)
│   │   │   └── ranking/route.ts     # Ranking por puntaje
│   │   ├── users/
│   │   │   ├── route.ts             # GET todos (admin+)
│   │   │   ├── me/route.ts          # GET/PATCH perfil propio
│   │   │   ├── me/password/route.ts # Cambio de contraseña
│   │   │   ├── search/route.ts      # GET search?q= (todos auth)
│   │   │   └── [id]/role|plan/      # PATCH rol/plan (admin+)
│   │   ├── esg/route.ts
│   │   ├── portfolio/route.ts
│   │   ├── courses/
│   │   ├── diagnostic/
│   │   └── organization/route.ts
│   └── layout.tsx
│
├── components/
│   ├── NavigationSidebar.tsx        # Sidebar con rol-based items + link /fase1
│   ├── HeroDashboard.tsx            # Panel principal
│   ├── DiagnosticInterface.tsx      # Cuestionario multi-paso
│   ├── SimbiocreacionDashboard.tsx  # Grafo interactivo + editor completo
│   ├── OrganizationProfile.tsx      # Perfil de organización
│   ├── ValidadorProyectos.tsx       # Validador IA (Claude API)
│   ├── InvestorPortfolio.tsx        # Portfolio de inversión
│   ├── EdutechDashboard.tsx         # Academia (cursos + inscripciones)
│   ├── SettingsDashboard.tsx        # Configuración de perfil
│   ├── SuperAdminDashboard.tsx
│   ├── AdminDashboard.tsx
│   └── GestorDashboard.tsx
│
├── contexts/
│   └── AuthContext.tsx              # Estado global de auth + perfil
│
└── lib/
    ├── repositories/                # Acceso a datos vía proxy
    │   ├── simbiocreacion-repository.ts
    │   ├── diagnostic-repository.ts
    │   ├── portfolio-repository.ts
    │   └── course-repository.ts
    ├── services/
    │   ├── diagnostic-service.ts
    │   └── course-service.ts
    ├── api/
    │   └── proxy-helper.ts          # proxyToBackend() — reenvía a VPS
    ├── constants/
    │   └── roles.ts
    └── types/
        └── database.ts              # Tipos: Profile, Simbiocreacion, StoredGraph…
```

---

## Módulos de la Plataforma

### Diagnóstico ESG
Cuestionario guiado con puntaje 0–100. Resultado guardado por usuario. Historial de evolución.

### Simbiocreación
Mapa visual de sesiones de co-creación. Grafo fuerza-dirigido con:
- Drag / pan / zoom (SVG con `requestAnimationFrame`)
- Editor completo: añadir/eliminar/renombrar nodos y conexiones
- Paleta de colores, presets (Categoría / Grupo / Persona)
- Vincular nodos persona a usuarios EYWA reales (búsqueda por nombre)
- Grafo persistido en BD como `graph_data JSONB` (`StoredGraph`)
- Panel Búsquedas: lista de grupos y participantes con edición rápida
- Tabs Explora (simbios públicos) y Ranking

### Panel ESG
15 indicadores en 5 dimensiones (Ambiental, Social, Gobernanza, Innovación, Cadena de Valor). Historial temporal.

### Portfolio de Inversión
Empresas del portafolio con score ESG, sector, riesgo (bajo/medio/alto), tendencia y fechas de auditoría.

### Academia (Edutech)
Catálogo de cursos por categoría (agrotech, ESG, banca sostenible…). Inscripciones con seguimiento de progreso.

### Mi Organización
Perfil completo: tipo, sector, descripción, país, website, links externos.

### Validador de Proyectos
Análisis con Claude AI. Retroalimentación estructurada sobre viabilidad, alineación ODS y mejoras.

---

## Sistema de Roles

| Rol | Acceso |
|-----|--------|
| `user` | Todas las vistas base |
| `gestor` | + Panel Gestor (portfolio + preguntas) |
| `admin` | + Panel Admin (gestión planes) |
| `superadmin` | + Panel SuperAdmin (roles + planes + todo) |

---

## Variables de entorno (`.env.local`)

```env
# Backend VPS
BACKEND_URL=http://161.132.54.226:4001
BACKEND_SECRET=eywa-internal-secret-2026

# Claude AI (Validador de Proyectos)
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Instalación local

```bash
git clone https://github.com/Afkaqui/eywa_frontend.git
cd eywa_frontend
npm install
cp .env.example .env.local   # completar con credenciales reales
npm run dev
```

---

## Deploy

**Frontend** → Vercel (CI/CD automático desde `main`):
```bash
git push origin main   # Vercel detecta y despliega automáticamente
```
URL producción: `https://eywa-hazel.vercel.app`

**Backend** → VPS (manual):
```bash
ssh kaqui@161.132.54.226
cd ~/eywa-backend
git pull
docker compose build --no-cache && docker compose up -d
```

---

## Base de datos (eywa_db)

Tablas principales gestionadas por Prisma:

| Tabla | Descripción |
|-------|-------------|
| `profiles` | Usuarios (id, email, full_name, role, plan, password bcrypt) |
| `simbiocreaciones` | Sesiones co-creación. Columna `graph_data JSONB` para grafo persistido |
| `esg_scores` | Scores ESG por usuario (15 campos) |
| `esg_history` | Historial de snapshots ESG |
| `portfolio_companies` | Empresas del portafolio |
| `organizations` | Perfil organizacional |
| `diagnostic_questions` | Preguntas del cuestionario |
| `diagnostic_options` | Opciones de respuesta con puntaje |
| `diagnostic_results` | Resultados guardados por usuario |
| `courses` | Catálogo de cursos |
| `course_enrollments` | Inscripciones y progreso |

**Nota importante:** la columna `graph_data` fue añadida manualmente:
```sql
ALTER TABLE simbiocreaciones ADD COLUMN IF NOT EXISTS graph_data JSONB;
```

---

## Tipos clave (`src/lib/types/database.ts`)

```typescript
// Grafo persistido en simbiocreaciones.graph_data
interface StoredGraph {
  nodes: Array<{
    id: string; label: string;
    type: 'center' | 'category' | 'group' | 'person';
    color: string;
    userId?: string;   // opcional: vincula a usuario EYWA real
  }>;
  edges: Array<{ from: string; to: string }>;
}
```

---

## Rutas públicas

| Ruta | Descripción |
|------|-------------|
| `/` | SPA principal (requiere auth) |
| `/fase1` | Presentación pública — qué es EYWA, herramientas, stack, roadmap |

---

## Fase 1 — Checklist

- [x] Auth completa (registro, login, roles, JWT)
- [x] Diagnóstico ESG (cuestionario + historial)
- [x] Panel ESG 15 indicadores
- [x] Simbiocreación — grafo interactivo con editor completo
- [x] Portfolio de inversión
- [x] Academia (cursos + inscripciones)
- [x] Mi Organización
- [x] Validador de Proyectos (Claude AI)
- [x] Dashboards por rol (Gestor / Admin / SuperAdmin)
- [x] Configuración de perfil + cambio de contraseña
- [x] API REST en VPS (Hono.js + Docker)
- [x] Deploy automático en Vercel

---

*EYWA Fase 1 · 2025 · Todos los derechos reservados.*
