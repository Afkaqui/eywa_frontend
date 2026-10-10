# EYWA — Plan de trabajo

> **Al 9 de octubre de 2026.** Este documento ordena *qué se hace y en qué orden*.
> El detalle técnico de cada punto vive en [`PENDIENTES.md`](PENDIENTES.md) (sección indicada
> como §N). Cuando algo se termina, se marca aquí y se registra allí con su commit.
>
> Todo lo que dice "verificado" se comprobó contra el código o la base de datos de producción
> el 2026-10-09, no de memoria.

---

## 1. Dónde estamos

| Módulo | Estado | Nota |
|---|---|---|
| Diagnóstico GENES (14 criterios) | ✅ En producción | Por empresa, con historial |
| Dataroom por empresa | ✅ En producción | 10 carpetas, % de completitud, invitados, perfil público |
| Validador de Proyectos | ✅ En producción | IA (Groq) + envío a MAVI/ARS LAB con consentimiento |
| Academia | ⚠️ Parcial | 2 cursos con contenido; **6 publicados vacíos** (ver Fase B) |
| Portfolio + Directorio de Actores (320) + Fondos | ✅ En producción | Fondos con verificador nocturno desde el 2026-10-09 |
| Simbiocreación | ✅ En producción | Grafo con actores reales y visor público |
| API externa v1 + capa pública + sello web | ✅ En producción | Primer cliente: Katy |
| Super Administración | ✅ En producción | Usuarios, contraseñas, auditoría, visitas, claves de API |

**Tracción real (verificada):** 14 usuarios · 6 organizaciones · 3 diagnósticos.
Sigue siendo el cuello de botella para postular a fondos que piden tracción (§Resumen de
PENDIENTES). Ninguna funcionalidad nueva mueve ese número por sí sola.

---

## 2. Cambios recientes (septiembre–octubre 2026)

| Fecha | Cambio | Commits |
|---|---|---|
| 09-02 → 09-17 | **Integración MAVI / ARS LAB**: envío desde el Validador con consentimiento, documentos derivados del dataroom (incl. legales) | `153e063` `c2dc966` `39fdeb1` |
| 09-25 | **Academia**: curso *Programa Desarrolladores de Negocios de Impacto* replicado de Classroom (14 secciones), material servido desde el VPS con soporte para adelantar vídeos, examen de 14 preguntas | `4ce175f` `83bc341` `06540bf` `331d485` |
| 10-07 | **API externa v1**: alta de empresas con diagnóstico GENES (EYWA calcula el puntaje), consultas, directorio público; fix del Portfolio (puntaje por empresa, no por usuario) | `3bd8077` `5e7d418` `fa41192` |
| 10-08 | **API completada según §9**: permisos por clave, panel para emitir/rotar/revocar claves, capa pública sin clave, **sello para la web de la empresa**, aviso "no es certificación" en todo puntaje | `a026635` `be1fa7e` |
| 10-08 | **Entrega a Katy**: guía PDF/MD, OpenAPI, ejemplos, script de prueba de conexión | Carpeta `EYWA/Entrega_API_Katy` |
| 10-09 | **Verificador nocturno de fondos** (reemplaza a la gema): revisa los 149 fondos cada noche a las 23:00 y propone cambios a una cola de revisión | `5a71765` `40e8a14` |

---

## 3. Plan por fases

### Fase A — Operativo inmediato (sin código; esta semana)

| # | Tarea | Responsable | Detalle |
|---|---|---|---|
| A1 | **Revisar los 33 pendientes del verificador de fondos** | Gestor | *Portfolio → Fondos*. Prioridad: los **16 enlaces de LinkedIn** que no llevan al fondo (la gema probablemente tiene las URL reales) y los **16 enlaces rotos** |
| A2 | Entregar la API a Katy | Angel | Carpeta lista. ⚠️ Lleva la clave en `.env`: si se envía por un canal compartido, sacar ese archivo y mandarlo aparte |
| A3 | Pedir a ARS que borre **8 registros nulos** de su cartera | Angel → ARS | 3 primeros envíos, 3 reenvíos, 1 proyecto de prueba, 1 sondeo (§14). Su API no permite borrar ni corregir |
| A4 | Qory: confirmar presupuesto y duración reales, alcance de saponinas (DIGEMID) y huito (Decisión CAN 516) | Qory | Hoy son estimaciones de EYWA |
| A5 | Revisar el examen del programa de Classroom, en especial las 3 preguntas sobre Ley BIC | Quien dictó el programa | Lo redactó EYWA y ya emite certificado |
| A6 | Descargar los **7 vídeos pendientes** del curso de Classroom | Angel | Se cortan en la pantalla de antivirus de Drive; descargarlos a mano y subirlos al VPS |
| A7 | Eduardo envía la **definición oficial de problema** y el **glosario de taxonomía verde** del MINAM | Eduardo | Desbloquea C1 y C3 |
| A8 | Recopilar **fichas de proyectos** formulados (con bases y criterios) | Equipo formulador | Desbloquea el emulador (C9) |
| A9 | Averiguar el avance de la **nueva calculadora TRL/CRL** del Estado | Quien sigue esa consultoría | Desbloquea IMI/TRL (C5) |

### Fase B — Funcional al 100 % (prioridad vigente desde el 2026-08-09)

Regla del proyecto: *ninguna pantalla promete lo que la plataforma no hace*. Verificado hoy:

| # | Qué | Acción | Esfuerzo |
|---|---|---|---|
| B1 | **6 cursos publicados sin contenido** (0 secciones, 0 preguntas): Introducción a la Sostenibilidad ESG, Certificación Orgánica, Huella de Carbono, Finanzas Sostenibles, BPA, Emprendimiento Digital | Despublicarlos hasta tener contenido, o mostrarlos como "Próximamente" sin inscripción | Bajo |
| B2 | **Términos y privacidad**: el registro exige aceptarlos y los enlaces van a `#` | **Decisión** (ver §4): redactarlos o quitar la casilla. Con MAVI y la API ya salen datos a terceros: es urgente | Contenido legal |
| B3 | Panel Principal: *Ver Análisis* y *Exportar Datos* sin acción | Retirar (o construir la exportación) | Bajo |
| B4 | Portada: *Ver Demo* sin acción | Retirar o enlazar a un vídeo | Bajo |
| B5 | Login: botones **Google** y **Apple** sin acción | Conectar Google (el backend ya existe: `next-auth` + `/oauth-sync`); retirar Apple | Bajo |
| B6 | Registro e inicio de sesión **no normalizan el correo** (mayúsculas) | Normalizar como ya hace la recuperación de contraseña | Bajo |
| B7 | `contacto@eywa.com` en la portada | Dominio que no controlamos: cambiar por uno real | Bajo |

### Fase C — Adecuación de lo que se promete en reuniones (§16.3)

Origen: reunión del 2026-10-08 (`Obs reu 08 10/Observaciones_para_EYWA.md`). Lo que se
presenta a terceros como hecho tiene que existir.

**Construibles ya (sin esperar a nadie):**

| # | Concepto | Cómo entra a la plataforma |
|---|---|---|
| C1 | **Definición del problema** | Sección en el Validador: actor, dolor, causa raíz, urgencia, consecuencia, unidad de validación. Sale en el reporte y alimenta a la IA. El texto oficial de Eduardo se enlaza al llegar (A7) |
| C2 | **Máximo Producto Posible (MPP)** | En el Validador: insumo principal → subproductos (uso, sector comprador, actual/potencial). Sale en el reporte |
| C3 | **Glosario** | En la Academia: MPP, IMI, TRL/CRL, quíntuple hélice, brecha sectorial, océano azul/rojo, blended finance, innovación/obras por impuestos, SbN, NDC, OKR, debida diligencia. Definiciones de EYWA marcadas "por validar con Eduardo"; el del MINAM se enlaza al llegar |
| C4 | **Observaciones del consultor** (el "30 % humano") | Campo visible solo para gestor/admin en cada proyecto |

**Con dependencia (no se inventan):**

| # | Concepto | Depende de |
|---|---|---|
| C5 | **Índice de Madurez Industrial (IMI)** + TRL/CRL. Alimenta el KPI "Reducción Gap IMI", hoy "Pendiente" | Criterios y escala de Eduardo; calculadora del Estado (A9) |
| C6 | **Nota conceptual 70/30** | C1 + C2 + diagnóstico; se genera con la IA del Validador y la completa el consultor |
| C7 | **Tablero OKR** por organización | Diseño con Eduardo |
| C8 | **Océanos azules** (postulantes por fondo) | Dato manual o publicado por cada fondo |
| C9 | **Emulador** (errores comunes de proyectos formulados) | Fichas del equipo (A8) |
| C10 | **Riesgo climático / seguros paramétricos** | Fuente de datos (SENAMHI, INDECI) |

**Fuera de EYWA:** la trazabilidad de cacao (pasaporte digital, centro de acopio, GIS, IoT) es
la **vertical agro**, un proyecto ProInnóvate aparte.

### Fase D — Fondos vivos (§16.2)

| # | Tarea | Estado |
|---|---|---|
| D1 | Re-verificación nocturna del catálogo | ✅ En producción (cron 23:00, cola de revisión) |
| D2 | Descubrimiento: **Prociencia** (API de WordPress, verificada) | Pendiente |
| D3 | Descubrimiento: **ProInnóvate** en `gob.pe` | Pendiente: falta resolver cómo leer la página |
| D4 | Descubrimiento: **UE Funding & Tenders** (API pública), filtrada por temas EYWA y elegibilidad LatAm | Pendiente |
| D5 | Fondos nuevos como **candidatos ocultos** hasta que un gestor los apruebe | Pendiente |
| D6 | Historial de corridas visible y aviso "cierran pronto" con datos vivos | Parcial (la corrida ya se registra) |

Regla: lo automático propone, un gestor decide. Medido: las reglas de fechas no son lo bastante
fiables para aplicar cambios solas.

### Fase E — API (§9, §15)

| # | Tarea | Depende de |
|---|---|---|
| E1 | `/match`: qué fondos encajan con cada empresa | Fase D (catálogo vigente) |
| E2 | Flujo para que el **dueño real reclame** una empresa dada de alta por API | Diseño |
| E3 | `/esg-score` (Validador como servicio) | Decidir cómo se etiqueta un resultado de IA |
| E4 | Puntaje GENES en el sello (opt-in del dueño) | Casilla de consentimiento |
| E5 | Límite de peticiones persistente (hoy en memoria, se reinicia con cada despliegue) | Solo si hay más de un contenedor o más tráfico |

### Fase F — Infraestructura y seguridad

| # | Tarea | Nota |
|---|---|---|
| F1 | **Backend en HTTPS** (`kaqui-sites add` sobre el DNS `apieywa`) | Requiere sudo en el VPS. Cierra también el falseo de IP de la capa pública |
| F2 | `AUTH_SECRET` del backend local es un texto de ejemplo | Solo afecta al entorno local; igualarlo al del frontend |
| F3 | Migración a Google Cloud (§10) | ⏸️ **En pausa** hasta instrucción expresa |
| F4 | Dockerizar el frontend (§11) | Planificado, no ejecutar |
| F5 | Estadística de uso y prueba de estrés (§10.2, §10.3) | Nunca contra el VPS compartido (40 contenedores ajenos) |

---

## 4. Decisiones que necesitan al usuario o al negocio

| Decisión | Opciones sobre la mesa | Bloquea |
|---|---|---|
| **Modelo de cobro** | EYWA hoy: Premium US$ 20/mes. Reunión: diagnóstico S/ 8.000–15.000 + IGV, 5 % de éxito por hito, meta S/ 2.000 por empresa | Precios en la plataforma, propuestas comerciales |
| **Términos y privacidad** | Redactarlos y publicarlos, o quitar la casilla del registro | B2 |
| **Precio de la API** | Gratuita, freemium o de pago | Nuevos clientes de la API |
| **Plazo de "3 meses"** mencionado en la reunión [00:43:52] | Precisar a qué se refiere | Priorización |
| **Perfiles de evaluadores** de fondos | Recomendación: no recopilarlos (Ley 29733); solo criterios públicos y ganadores publicados | Diseño del buscador de fondos |

---

## 5. Riesgos

| Riesgo | Mitigación |
|---|---|
| Se presentan como existentes funciones que no lo están (nota conceptual 70/30, conexión con PRODUCE) | Fase C, y la regla de §16: decir "en desarrollo" hasta que exista |
| El registro exige aceptar documentos que no existen, mientras se envían datos a terceros (MAVI, API) | B2 |
| Catálogo de fondos con enlaces rotos o de LinkedIn | A1 (ya marcados por el verificador) |
| Registros duplicados en ARS: su API no permite corregir ni borrar | Enviar a MAVI solo cuando el proyecto esté completo; A3 |
| Poca tracción frente a convocatorias que la piden | Pilotos reales (Qory, cliente de climatización, Katy) en vez de funcionalidades nuevas |

---

## 6. Orden recomendado

1. **Fase A** en paralelo (es trabajo de personas, no de código).
2. **B1, B2 (con la decisión), B3–B7**: cerrar lo que hoy promete de más. Son cambios pequeños.
3. **C1–C4**: lo que se está prometiendo y ya se puede construir.
4. **D2–D5**, y después **E1** (`/match`), que depende del catálogo vigente.
5. Lo demás según lleguen las dependencias (C5–C10) y las decisiones (§4).
