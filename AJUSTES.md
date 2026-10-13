# AJUSTES.md — Correcciones y mejoras para Laurel (ronda de revisión 1)

> Contexto: la app ya está desplegada en GitHub Pages (`https://carlosgarcia-tech.github.io/laurel/`) y las 10 plantillas existen. Esta es la lista de cambios tras revisar el resultado.
> Sigue respetando `AGENTS.md` y `TEMPLATES.md` (v2: todas las plantillas son variantes de la estructura de Corona; un solo componente `ResultImage` + `TemplateConfig`).
> **Orden de trabajo:** P0 → P1 → P2. Al terminar cada prioridad: `lint`, `typecheck`, `test`, `build` en verde y resumen de lo hecho.

---

## P0 — Bugs (corregir primero)

### 0.1 La plantilla "Selva" no usa su propia paleta ni su tipografía
**Síntoma:** con "Selva" seleccionada, la vista previa muestra el acento **esmeralda de Corona** (`#34d399`) en chips, kicker y barras, y el título se ve en una fuente ancha tipo Syne, **no** en Zilla Slab (par P8). Solo `accent2` (cobre) parece correcto.

**Qué revisar (en este orden):**
1. **Overrides filtrándose entre plantillas:** el acento/texto del usuario debe guardarse en `styleByTemplate[templateId]`. Al cambiar de plantilla **no** debe arrastrarse el override de otra. Si no hay override para esa plantilla, se usa el `accent` de `templates.ts`.
2. **Valor por defecto del color de acento en el formulario:** si el input de acento se inicializa con un valor fijo (`#34d399`) y se guarda como override al montar, está pisando el token de la plantilla. El input debe mostrar el token actual, pero **solo guardar override cuando el usuario lo cambie**.
3. **Par de fuentes:** al elegir plantilla, cargar el `fontPairId` por defecto de esa plantilla (si el usuario no eligió otro). Verificar que la CSS variable `--font-display` / `--font-body` se actualiza y que se espera a `document.fonts.ready` + `document.fonts.check()` antes de renderizar/exportar.
4. **Persistencia vieja:** una configuración guardada en `localStorage` con `fontPairId`/`accent` globales no debe imponerse a plantillas nuevas (agregar `schemaVersion` y migración).

**Aceptación:** test (Vitest + Testing Library) que selecciona cada una de las 10 plantillas y comprueba que `--accent`, `--accent2`, `--bg` y la familia tipográfica resultante coinciden con `templates.ts`. Captura manual de Selva con chips en verde musgo `#9bd16b` y títulos en slab.

### 0.2 Confirmar los otros estados de la UI
- El mensaje **"PNG descargado"** debe desaparecer solo (≈ 4 s) y tener `aria-live="polite"`.
- Después de descargar, el estado no debe quedarse pegado si luego se cambia algo.

---

## P1 — Diseño y usabilidad

### 1.1 Galería de plantillas (el punto más flojo)
**Problema:** las miniaturas son diminutas, van en una sola columna y las etiquetas muestran jerga interna (`OSCURA · LEFT · BARS`, `CLARA · SPLIT · BARS`).

**Cambios:**
- Cuadrícula de **2 columnas** en el panel (y 3 en pantallas anchas si hay espacio), miniaturas **≥ 200 px de ancho** con la proporción 4:5 real.
- Cada tarjeta: miniatura real (el mismo `ResultImage` a escala, carga perezosa), **nombre**, y una línea con etiquetas **legibles**: tema + estilo de podio + estilo de lista. Nada de `LEFT/BANNER/SPLIT/CHIPS` en la UI.
- Mapa de etiquetas en `i18n/es.ts`:
  - tema: `dark` → "Oscura", `light` → "Clara"
  - podio: `stepped` → "Podio escalonado", `row` → "Podio en fila", `hero` → "Primer lugar destacado"
  - lista: `bars` → "Barras", `dots` → "Puntos guía", `chips` → "Chips"
  - Ejemplo: `Oscura · Podio en fila · Barras`
- Estado seleccionado claro (borde `accent` + marca visible, no solo color), foco visible y navegación por teclado (`role="radiogroup"` / `radio`).
- La vista previa grande debe ser **sticky** en escritorio para verla mientras se hace scroll por el formulario.

**Aceptación:** poder comparar 4+ plantillas a la vez sin hacer scroll infinito; ninguna etiqueta técnica en inglés visible.

### 1.2 Paletas demasiado parecidas → más variedad real
Hoy hay mucha repetición: Corona/Selva son verdes; Medianoche/Cobalto son azules; Brasa/Pista/Ámbar son oscuras con naranja-ámbar; solo 2 de 10 son claras.

**Cambios (mantener estructura, cambiar identidad):**

**a) `selva` → renombrar a `arena` · "Arena" (clara)** — id nuevo `arena`, con **migración** de `templateId: 'selva'` → `'arena'` en storage.
| bg | surface | border | text | muted | accent | accent2 |
|---|---|---|---|---|---|---|
| `#efe3cf` | `#f8f0e0` | `#d3c2a3` | `#2a2118` | `#6b5d4a` | `#b5532a` | `#2f6f62` |

Config: `theme: 'light'`, mismos `header: left`, `podium: hero`, `list: chips`, `mvp: cards`, `mvpPlacement: after-list`, `decor: dots`, `radius: 8`, `numerals: plain`, fuentes P8 (Zilla Slab + Karla).

**b) `pista` → pasar a clara · "Pista" (concreto claro)**
| bg | surface | border | text | muted | accent | accent2 |
|---|---|---|---|---|---|---|
| `#e8e8e3` | `#f6f6f2` | `#c9c9c1` | `#151515` | `#5b5b55` | `#e8590c` | `#b7791f` |

Config sin cambios estructurales (`split`, `row`, `chips`, `cards`, `before`, `stripes`, `radius 0`, `pad`, P5), `theme: 'light'`. `readableOn(accent)` debe elegir texto oscuro sobre los chips naranja.

**Resultado esperado:** 4 claras (Marfil, Hielo, Arena, Pista) y 6 oscuras con tonos distintos (verde Corona, rojo-naranja Brasa, azul noche Medianoche, vino Granate, cobalto Cobalto, ámbar Ámbar).

**Aceptación:** hoja de contactos (`npm run contact-sheet`) donde se distinguen las 10 de un vistazo; contraste ≥ 4.5:1 en texto principal y ≥ 3:1 en elementos grandes para las dos nuevas paletas.

### 1.3 Espacios muertos en la imagen (4:5 con pocos equipos)
**Problema:** con 10 equipos queda un hueco entre el final de la lista y el bloque MVP, y otro antes del pie.

**Cambios:**
- Las filas de la lista deben **crecer** (`flex: 1 1 0`, con `min-height: 44px` y `max-height: 68px`) para repartir la altura sobrante.
- Los bloques usan separación constante (22 px) y el **pie queda anclado abajo** (`margin-top: auto`).
- Si todavía sobra espacio (muy pocos equipos), aumentar el tamaño del podio, no dejar vacío.
- Misma lógica en 9:16 y 1:1.

**Aceptación:** con 3, 6, 10 equipos en 4:5 no hay un hueco vertical > 2× la separación normal entre bloques.

### 1.4 Logo sin marco
**Problema:** el logo (círculo) aparece dentro de una caja cuadrada con borde que lo achica.

**Cambios:**
- El slot del logo **no lleva borde ni fondo**; la imagen se muestra con `object-fit: contain` en su forma real.
- Tamaño: ≈ 104 px en cabecera (88 px en `center`); en `banner` sobre el color de acento, sin caja.
- Si el usuario sube un logo no cuadrado, respetar su proporción. Para el logo por defecto (`logo.svg`/`logo.png`), mostrar el círculo tal cual.
- La opción de recorte circular (radio ≥ 14) solo aplica **si el usuario la activa**; no recortar por defecto.

### 1.5 Fecha en formato latino
**Problema:** el campo muestra `MM/DD/AAAA` (`10/13/2026`) porque `<input type="date">` sigue el idioma del navegador.

**Cambios:**
- Reemplazar por un **input de texto con máscara `DD/MM/AAAA`** + botón de calendario (o selector propio), con validación y mensajes de error en español.
- Internamente guardar ISO (`YYYY-MM-DD`). En la imagen, formato es-MX corto (`13 OCT 2026`) y largo (`13 de octubre de 2026`) según la plantilla (`formatDateEs()` en `core/viewmodel/format.ts`, con tests).
- La nota actual "En la imagen se muestra como «13 OCT 2026»" se mantiene.

### 1.6 Criterios de desempate editables
**Problema:** dice "en este orden" pero no se puede reordenar.

**Cambios:**
- Cada criterio con casilla + **botones subir/bajar** (y arrastrar si es sencillo), accesibles por teclado.
- El motor (`core/engine/tiebreak.ts`) usa exactamente el orden y los criterios activos del usuario; con tests (mismo log, distinto orden → resultado distinto cuando haya empate).
- Guardar el orden en los ajustes.

---

## P2 — Mejoras menores

1. **Marca "LAUREL" en el pie:** agregar interruptor "Mostrar marca Laurel" (activado por defecto). Si está apagado, el pie muestra solo moderador y sala.
2. **Nombre de archivo cargado:** truncado con elipsis en el medio y `title` con el nombre completo.
3. **Texto del botón de quitar archivo:** reemplazar la "X" por un icono SVG accesible (`aria-label="Quitar archivo"`).
4. **Etiquetas del encabezado de la vista previa:** `SELVA · VISTA PREVIA` → mostrar el nombre de la plantilla actual en capitalización normal.
5. **Estados de error amables** si el archivo no es un log válido (sin romper la app) y si falla la exportación.

---

## QA pendiente (probar y reportar resultados)

Estas pruebas aún **no** se han verificado; ejecútalas con el fixture del log real y reporta qué falla:

- [ ] Formatos **9:16** y **1:1** de **las 10 plantillas** (se recomponen, no solo se escalan).
- [ ] **16 y 24 equipos** (densidad `compact` y `multi` → "Parte 1/2").
- [ ] **Nombres con unicode:** `ㅤ`, superíndices (`⁷`, `²⁶`), kanji, símbolos; ningún nombre desborda ni deja huecos feos.
- [ ] Sin logo, sin fondo, con fondo muy claro y muy oscuro, en plantillas claras y oscuras.
- [ ] PNG exportado idéntico a la vista previa (fuentes, imágenes, recortes) en Chromium, Firefox y Safari.
- [ ] Móvil: el editor se apila y la vista previa es usable.
- [ ] Varios archivos (varias salas): acumulado correcto y "Resultados por sala".

---

## Revisión del sitio desplegado (pendiente de tu verificación)

El sitio carga bajo `/laurel/` (la base de Vite funciona) y tiene `title`, `description` y `viewport`. Falta revisar y completar:

- [ ] `lang="es"` en `<html>`.
- [ ] Metadatos para compartir: `og:title`, `og:description`, `og:image` (PNG 1200×630 con el logo), `twitter:card`, `theme-color`.
- [ ] Favicon con `logo.svg` (y `apple-touch-icon` PNG 180×180) usando `import.meta.env.BASE_URL`.
- [ ] Que ningún asset se pida a una ruta absoluta (`/assets/...`) en lugar de relativa a `/laurel/`.
- [ ] Lighthouse móvil: Rendimiento ≥ 90, Accesibilidad ≥ 95, Buenas prácticas ≥ 95; reportar los números reales.
- [ ] Peso inicial de JS ≲ 200 KB gzip y fuentes cargadas solo de la plantilla/par en uso.

---

## Definición de terminado de esta ronda
- [ ] Selva/Arena y todas las plantillas respetan su paleta y su tipografía (test automatizado).
- [ ] Galería en cuadrícula con miniaturas grandes y etiquetas en español.
- [ ] 4 plantillas claras y 6 oscuras con identidades de color distintas.
- [ ] Sin huecos verticales grandes con 3–10 equipos.
- [ ] Logo sin caja, fecha en DD/MM/AAAA, desempate reordenable.
- [ ] QA completo reportado y metadatos del sitio añadidos.
