# UNANCHA (antes EYWA) — Identidad visual y de marca

> **Fuente de verdad del diseño.** Todo el proyecto (frontend, documentos, PDFs,
> correos) debe respetar esta identidad. Derivada de los **módulos fundacionales**
> (21-mar-2026): HomePage, HeroDashboard, DiagnosticInterface, InvestorPortfolio,
> LoginPage, NavigationSidebar, ValidadorProyectos, ProfessionalTrustGauge.
>
> Si un componente nuevo contradice este documento, gana este documento.
> Última actualización: 2026-11-21

---

## 1. Marca

> **Cambio de marca (2026-11-21):** EYWA pasa a llamarse **UNANCHA** en toda la
> plataforma (web, Agro, correos, PDFs). Fuente: `../branding/unancha/Dossier_UNANCHA_001.docx`.
> El nombre está sujeto a verificación en INDECOPI y la EUIPO: se lee siempre de
> `src/lib/brand.ts` (BRAND) para poder cambiarlo en un solo lugar. Los recursos de
> la marca anterior están en `../branding/eywa_anterior/`.

- **Nombre:** UNANCHA (siempre en mayúsculas). Producto agro: **UNANCHA Agro**.
- **Significado:** en quechua, *unancha* es estandarte, insignia o marca distintiva:
  lo que da fe de quién es alguien o de dónde viene algo.
- **Descriptor:** "Plataforma de Orquestación Ecosistémica y Sostenibilidad".
  Eslogan agro: "Unancha: el sello de origen de tu cacao" / "proof of origin, from plot to sack".
- **Símbolo:** un estandarte. El mástil es el origen (parcela y productor); las tres
  franjas, la trazabilidad (parcela, cosecha y lote) y las terrazas; la punta en V,
  el sello verificable. Archivos: `public/logo.png` (cacao, fondo claro),
  `public/logo.svg`, `public/logo-invertido.svg` (blanco y bosque, fondo cacao).
- **Firma:** símbolo + "UNANCHA" en Archivo ExtraBold (`font-marca font-extrabold`)
  + tagline. El símbolo puede usarse solo; por debajo de 16 px, solo el símbolo.
- **Tipografía:** Archivo (logotipo y titulares h1/h2) e IBM Plex Sans (interfaz y datos),
  cargadas en `layout.tsx`.
- **Métrica insignia:** el **Trust Score**. Lo *medible/verificable* es el ADN: nada de
  datos inventados (ver §7).

## 2. Color

### Paleta UNANCHA (cerrada)
| Nombre | Hex | Uso |
|-------|-----|-----|
| Cacao  | `#2B1A10` | Marca y textos. En Tailwind: `cacao`, y `gray-900`/`gray-800` reasignados. |
| Bosque | `#1E7A4C` | Verificado, EUDR y la acción principal. En Tailwind: `bosque` y toda la escala `emerald-*` reasignada (`emerald-600` = bosque). |
| Brote  | `#DCEFE3` | Fondos de estado. `brote` = `emerald-100`. |
| Neutro | `#F7F7F5` | Base. `neutro` = `gray-50`. |

La reasignación vive en `src/app/globals.css` (`@theme`) y, para Agro, en el
`tailwind.config` de `agro-web/index.html`. Por eso las clases `emerald-*` de abajo
siguen siendo válidas: ya pintan en bosque. Regla del dossier: el verde aparece
sobre todo cuando algo está verificado; en piezas nuevas, preferir cacao para la marca.

### Escala verde (emerald → bosque)
| Token | Uso |
|-------|-----|
| `emerald-600` | **Acción primaria**: botones, enlaces, foco. |
| `emerald-700` | Hover de la acción primaria; texto verde sobre claro. |
| `emerald-500` | Íconos y acentos; inicio de gradientes. |
| `emerald-100` | Fondos suaves (brote). |
| `emerald-50`  | Fondos muy suaves. |

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
4. **Identidad v2 (§9):** llevar las vistas internas (paneles de EYWA y app de Agro) al
   nuevo patrón; hoy solo las landings lo usan. Maqueta de referencia con todas las vistas:
   https://claude.ai/artifact/1YKtdFTYe9r7s3n4xhWDgW

---

## 9. Identidad v2 (2026-11-17) — landings y adelante

Inspirada en el movimiento de Open Food Chain y en la combinación foto + texto de SpaceAG,
sin copiar sus diseños. Todo lo de §1–§7 sigue vigente; esto lo amplía.

- **Nombre de marca centralizado:** `src/lib/brand.ts` (`BRAND.name`, `BRAND.tagline`,
  `BRAND.agro`). El nombre "EYWA" cambiará: el texto nuevo lo lee de ahí.
- **CTA principal = píldora:** `rounded-full bg-emerald-500 text-emerald-950 font-semibold`
  (hover `bg-emerald-400` y sube 2px). Secundario: píldora con `border-gray-300` (o
  `border-white/50` sobre foto). Los botones de la app interna siguen con `rounded-lg`
  hasta migrarlos.
- **Agro:** mismo sistema con verde más profundo: `green-800` (botones), `green-950`
  (fondos con foto), `green-500` (CTA sobre oscuro). No usar `teal`.
- **Titulares:** grandes, `font-bold`/`font-semibold`, `tracking-tight`. Recursos:
  dos tonos (`text-gray-400` + negro) y palabras clave resaltadas en negrita verde.
- **Foto + texto:** filas alternas imagen/texto, banda de foto a sangre con overlay verde
  oscuro y cifras encima, tarjetas `rounded-3xl`, fotos del territorio (nunca genéricas).
- **Movimiento** (clases en `globals.css` y en `agro-web/index.html`):
  - `ey-blur-in` — entrada al cargar, palabra por palabra con `animation-delay`.
  - `ey-reveal`, `ey-reveal-blur`, `ey-reveal-pop` — aparición al hacer scroll
    (CSS `animation-timeline: view()`; donde no hay soporte, el contenido se ve igual).
  - `ey-lift` (tarjetas que suben), `ey-zoom` (foto que se acerca), `ey-float`
    (ilustración flotando), `ey-marquee` (marquesina), `ey-hero-zoom` (foto del hero).
  - Todo se apaga con `prefers-reduced-motion`.
- **Honestidad radical aplicada al marketing:** cifras solo reales (`/stats/public`), con
  esqueleto mientras cargan (nunca "—"); ilustraciones de producto rotuladas
  "Vista de ejemplo"; respaldos como texto hasta tener permiso para usar sus logos; nada
  de teléfonos, correos o redes de relleno.
