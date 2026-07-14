# EYWA — Identidad visual y de marca

> **Fuente de verdad del diseño.** Todo el proyecto (frontend, documentos, PDFs,
> correos) debe respetar esta identidad. Derivada de los **módulos fundacionales**
> (21-mar-2026): HomePage, HeroDashboard, DiagnosticInterface, InvestorPortfolio,
> LoginPage, NavigationSidebar, ValidadorProyectos, ProfessionalTrustGauge.
>
> Si un componente nuevo contradice este documento, gana este documento.
> Última actualización: 2026-07-13

---

## 1. Marca

- **Nombre:** EYWA (siempre en mayúsculas).
- **Descriptor:** "Plataforma de Orquestación Ecosistémica y Sostenibilidad".
- **Concepto:** conectar y orquestar ecosistemas (gobierno, empresas, inversores,
  sociedad civil) con datos para una **sostenibilidad medible**.
- **Símbolo:** un árbol formado por una red de nodos (naturaleza + datos). El verde
  de sus hojas es el color primario de la marca.
- **Métrica insignia:** el **Trust Score** (medidor de confianza). La confianza y lo
  *medible/verificable* son el ADN — nada de datos inventados (ver §7).

---

## 2. Color

### Primario — Emerald (verde EYWA)
Es EL color de la marca (176 usos en los módulos fundacionales; **cero teal**).

| Token | Uso |
|-------|-----|
| `emerald-600` | **Acción primaria**: botones, enlaces, foco. El más usado. |
| `emerald-700` | Hover de la acción primaria; texto verde sobre claro (contraste WCAG). |
| `emerald-500` | Íconos y acentos; inicio de gradientes. |
| `emerald-100` | Fondos suaves (chips activos, badges, halos de ícono). |
| `emerald-50`  | Fondos muy suaves (paneles destacados). |
| `emerald-400 / 900` | Apoyo (gradiente claro / texto muy oscuro puntual). |

**Gradiente de marca:** `bg-gradient-to-br from-emerald-500 to-emerald-700`
(variante clara `from-emerald-400 to-emerald-600`). Se usa en el mark del logo,
avatares y CTAs destacados.

### Neutrales — Gray
| Token | Uso |
|-------|-----|
| `gray-900` | Títulos; **fondo del estado activo** de navegación (pill oscuro con texto blanco). |
| `gray-700` | Texto de énfasis. |
| `gray-600` | Cuerpo de texto. |
| `gray-500` | Texto secundario / labels. |
| `gray-400` | Texto sutil, placeholders, íconos apagados. |
| `gray-200` | **Bordes** (el borde por defecto). |
| `gray-100` | Divisores suaves, chips neutros. |
| `gray-50`  | **Fondo de página** y de superficies internas. |

### Semánticos (no decorativos — solo por significado)
| Color | Significado | Ejemplo |
|-------|-------------|---------|
| `blue-*`   | Informativo / secundario | notas, avisos neutros |
| `amber-*`  | Advertencia / pendiente  | "Pendiente de análisis", preliminar |
| `red-*`    | Error / peligro          | validaciones, cerrar sesión |
| `purple-*` | Acento categórico puntual | tipos, etiquetas |

### ❌ Prohibido
- **`teal-*`** — es drift (Simbiocreación, Actores, Academia, EsgDashboard,
  Certificados lo introdujeron). **Migrar todo `teal-N` → `emerald-N`** (mismo número).
- Colores de acento como decoración arbitraria. Un color solo entra por significado.
- Inventar hex sueltos: usar la escala Tailwind emerald/gray.

---

## 3. Forma

| Elemento | Radio | Nota |
|----------|-------|------|
| Botones, inputs, chips pequeños | `rounded-lg` | el más común |
| **Tarjetas** | `rounded-xl` | contenedor estándar |
| Modales y tarjetas grandes | `rounded-2xl` | |
| Píldoras, avatares, badges | `rounded-full` | |

**Sombra:** discreta. `shadow-sm`/`shadow-md` en reposo; `shadow-lg` para elevación
o hover de tarjeta. Nada de sombras duras.

**Bordes:** `border border-gray-200` por defecto. Las tarjetas son *fondo blanco +
borde gris-200* sobre *fondo gris-50*.

---

## 4. Tipografía

- **Familia:** sans-serif del sistema (default de Tailwind: `system-ui, -apple-system,
  Segoe UI, Roboto…`). No se importa fuente custom — mantenerlo así salvo decisión de marca.
- **Base:** 16px. Pesos: 400 (normal) y 500 (medium); 600/700 para títulos.
- **Títulos de página:** grandes y elegantes — `text-2xl`/`text-3xl`. Dos estilos válidos
  del core: `font-light` (elegante, estilo Portafolio/Validador) o `font-bold` (con más
  presencia). Elegir uno por pantalla y ser consistente.
- **Jerarquía:** título `text-gray-900` → cuerpo `text-gray-600` → secundario `text-gray-500`
  → sutil `text-gray-400`.

---

## 5. Componentes — patrones canónicos

- **Tarjeta:** `bg-white border border-gray-200 rounded-xl p-5/6` sobre `bg-gray-50`.
- **Botón primario:** `bg-emerald-600 text-white rounded-lg hover:bg-emerald-700` + ícono
  a la izquierda (lucide-react, `w-4/5 h-4/5`).
- **Botón secundario:** `border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50`.
- **Nav activo:** `bg-gray-900 text-white shadow-md` (pill oscuro); inactivo
  `text-gray-600 hover:bg-gray-50`.
- **Pestañas:** subrayado inferior `border-b-2`, activa `border-gray-900 text-gray-900`
  (o `border-emerald-600 text-emerald-700`), inactiva `border-transparent text-gray-500`.
- **Badge/chip:** `rounded-full` o `rounded-lg`, `bg-<color>-50 text-<color>-700` + punto.
- **Íconos:** **lucide-react** (única librería de íconos). Trazo fino, tamaño 4-5.
- **Estados vacíos / carga:** ícono gris-300 grande + texto gris-400/500 centrado;
  spinner `animate-spin` en emerald o gris.

---

## 6. Layout

- Fondo de app: `bg-gray-50`. Contenido en contenedores centrados
  (`max-w-7xl`/`max-w-[1600px] mx-auto px-4 md:px-8`).
- Cabecera de sección: `bg-white border-b border-gray-200` con título + acciones.
- Sidebar: blanca, ítems con el patrón de nav activo. Colapsable (icono centrado).

---

## 7. Tono y principios

- **Idioma:** español. Profesional pero cercano; claro, sin jerga vacía.
- **Honestidad radical:** si un dato no existe, se muestra **"Pendiente"**, no un número
  inventado. No se dejan cascarones (botones/UI que prometen algo que no hacen). Ver
  `PENDIENTES.md`. La marca vende *confianza medible*: la UI no puede mentir.
- **Sostenibilidad medible, verificable, trazable.**

---

## 8. Deuda de identidad (a corregir para cumplir este doc)

1. **Migrar `teal-*` → `emerald-*`** en: `SimbiocreacionDashboard`, `ActorsDirectory`,
   `EdutechDashboard`/`CourseViewer`, `certificate-pdf`, `EsgDashboard`, visor `/simbio`.
2. **Logo:** el archivo `public/logo.png` dice "DATAOPS STARTUP", no EYWA. Reemplazar por
   el logo real de EYWA (manteniendo el concepto árbol-red y el verde).
3. Unificar el estilo de título por pantalla (mezcla de `font-light` y `font-bold`).
