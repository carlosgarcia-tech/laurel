# TEMPLATES-FREEFIRE.md — Plantillas específicas de Free Fire (extensión de TEMPLATES v2)

> **Este archivo EXTIENDE `TEMPLATESv2.md`, no lo reemplaza.**
> Las reglas de estructura, geometría, exportación y "que no parezca IA" de v2 siguen mandando.
> Aquí solo se agregan: (a) 3 plantillas temáticas de Free Fire como **variantes de Corona**, (b) 2 decoraciones nuevas, (c) 3 pares de fuentes nuevos y (d) la capa de **movimiento del editor** diseñada con las skills de Emil Kowalski.
> Si hay contradicción en lo visual de la imagen exportada, manda v2 §1 y §3. Si hay contradicción en animación, manda este archivo.

---

## 0. Qué se pide y qué NO

**Se pide:**
- Plantillas pensadas para torneos/scrims de **Free Fire**: lenguaje visual de battle royale (zona segura, rangos, "BOOYAH"), tipografía condensada y pesada, cortes diagonales, paletas cálidas.
- **Siguen siendo Corona**: mismo esqueleto (cabecera → podio → lista → MVP → pie), mismos datos, misma geometría 1080×1350. Se reconocen como la misma familia.
- Un comportamiento de interfaz (galería, selector, vista previa) con movimiento **sobrio y rápido**, siguiendo la filosofía de `emil-design-eng`.

**NO se hace:**
- **No usar activos oficiales** de Garena/Free Fire: ni logo, ni personajes, ni armas, ni mapas, ni capturas, ni su tipografía propietaria. Las plantillas son "inspiradas en", con geometría y texto propios. El logo es siempre el del usuario.
- No inventar datos ni textos de relleno visibles. El sello `BOOYAH ×N` solo aparece si el equipo **tiene booyahs en los datos**.
- **No animar la imagen exportada.** El PNG es estático y determinista (v2 §8). Todo el movimiento vive en el editor.

---

## 1. Skills que el agente debe usar (en este orden)

Antes de escribir código, **lee el `SKILL.md` de cada una** (están en `skills/`):

| Orden | Skill | Para qué se usa aquí |
|---|---|---|
| 1 | `emil-design-eng` | **Guía principal.** Criterio de cuándo animar, curvas, duraciones, estados `:active`, detalles invisibles. Toda la sección 6 sale de aquí. |
| 2 | `animation-vocabulary` | Nombrar con precisión cada movimiento (fade, slide, stagger, crossfade) en el código y en `DECISIONS.md`. |
| 3 | `animation-performance` | Solo `transform` y `opacity`; nada que fuerce layout; verificar con perfilador. |
| 4 | `high-end-visual-design` + `design-taste-frontend` | Calidad visual de la **galería y el editor** (no de las plantillas, que ya están definidas abajo). |
| 5 | `industrial-brutalist-ui` | Referencia de carácter para `booyah` (cortes duros, ángulos rectos, tipografía condensada). Solo como inspiración; los valores exactos son los de esta spec. |
| 6 | `review-animations` + `break-ui` | **QA final**: revisar cada animación y tratar de romper la UI (estados raros, nombres largos, teclado, reduced-motion). |
| 7 | `full-output-enforcement` | No dejar archivos a medias ni `// TODO` al entregar. |

Si alguna skill no existe en el entorno, anótalo en `DECISIONS.md` y continúa con el criterio de `emil-design-eng`.

---

## 2. Cambios al sistema (mínimos y explícitos)

### 2.1 Tipos nuevos (`types.ts`)
```ts
export type DecorV =
  | 'rings' | 'slashes' | 'arcs' | 'brackets' | 'dots' | 'stripes' | 'grid' | 'scan'
  | 'chevrons' | 'zone';                       // NUEVOS (sección 4)

export interface TemplateConfig {
  // ...todo lo de v2...
  category: 'general' | 'free-fire';           // NUEVO: la galería muestra una pestaña "Free Fire"
}
```
Las 10 plantillas de v2 reciben `category: 'general'` sin cambiar nada más. Los 3 valores de §3 llevan `'free-fire'`.

### 2.2 Qué NO cambia
- `ResultImage` sigue siendo el único componente. Las plantillas de Free Fire son **solo objetos en `templates.ts`** + 2 decoraciones nuevas en `Decor.tsx` + 3 pares en `fonts.ts`.
- Ninguna sección nueva, ningún bloque nuevo, ninguna lógica de negocio en las secciones.
- Regla de familiaridad de v2: cada plantilla cambia **≥ 3** opciones de la tabla 1.2 respecto a Corona (las tres de abajo cambian 6 o más).

---

## 3. Catálogo Free Fire (implementarlas TODAS)

### 3.1 Configuración

| # | id · nombre | tema | cabecera | podio | lista | MVP | pos. MVP | decoración | radio | num. | fuentes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 11 | `booyah` · **Booyah** | oscuro | banner | hero | chips | strip | **before** | chevrons | 0 | pad | P11 |
| 12 | `zona-roja` · **Zona Roja** | oscuro | split | row | bars | cards | after | zone | 4 | plain | P12 |
| 13 | `kalahari` · **Kalahari** | **claro** | center | stepped | dots | cards | after | slashes | 8 | ordinal | P13 |

Cambios frente a Corona: `booyah` (cabecera, podio, lista, MVP, posición MVP, decoración, radio = 7), `zona-roja` (cabecera, podio, decoración, radio, numeración = 5), `kalahari` (tema, cabecera, lista, decoración, radio, numeración = 6).

### 3.2 Tokens de color

| id | bg | surface | border | text | muted | accent | accent2 |
|---|---|---|---|---|---|---|---|
| booyah | `#0d0a06` | `#17110a` | `#3b2a14` | `#f6efe2` | `#b09a7d` | `#ff8a00` | `#ffd23a` |
| zona-roja | `#0a0e12` | `#121a21` | `#263541` | `#eef2f4` | `#8c9eab` | `#ff3b30` | `#ffb020` |
| kalahari | `#efe3c9` | `#f8f0dc` | `#d2bf98` | `#2a1a0e` | `#6d5a43` | `#c2410c` | `#1f6f6b` |

`deriveTokens` igual que v2 §5.2. En `kalahari`, `accent` (#c2410c) **solo** se usa como relleno o texto grande (≥ 3:1); el texto pequeño usa `text`/`muted`.

### 3.3 Notas por plantilla

**11 · Booyah** — La más "Free Fire": negro cálido, naranja y amarillo. Banner naranja de ancho completo con el título en negro (`readableOn(accent)`), podio *hero* con el 1.º enorme a la izquierda, lista con chips cuadrados (top 5 rellenos en naranja), MVP en franja **antes** de la lista. Ángulos rectos, `chevrons` arriba a la derecha. Si el 1.º tiene booyahs, lleva el sello tipográfico `BOOYAH ×N` (texto en `accent2`, borde 2 px, sin ícono).

**12 · Zona Roja** — Inspirada en la zona que se cierra. Gris azulado casi negro con rojo y ámbar. Cabecera *split* con cifras grandes (kills, puntos, booyahs, equipos) a la derecha, podio en fila, lista con barras. Decoración `zone`: círculos concéntricos (uno punteado) y una cruceta, como un mapa táctico. Numeración sin relleno (`4`).

**13 · Kalahari** — Variante clara del desierto: arena, tierra cocida y verde azulado. Centrada, podio escalonado, lista con puntos guía y ordinales (`4.º`), diagonales en la esquina. Aspecto de cartel de torneo "de temporada". Sin fondo propio → color plano `bg` + decoración (v2 §7).

---

## 4. Decoraciones nuevas (siempre por debajo del contenido, solo CSS/SVG simple, sin filtros)

- **`chevrons`**: tres chevrones `>` geométricos (polígonos SVG, grosor 22 px, inclinados) en la esquina superior derecha, `accent` con opacidad .9 / .55 / .3, separados 26 px. Distinto de `slashes`: son flechas, no barras.
- **`zone`**: centro en (900, 1150) del lienzo lógico; círculos de radio 160 / 300 / 460, trazo 1.5 px; el de 300 punteado (`8 6`); cruceta de 40 px en el centro y un punto de 6 px en `accent2`. Opacidad .10–.18 (`accent` y `accent2`). Se recorta al lienzo.

Ambas se escalan con el formato (4:5, 9:16, 1:1) y reciben `radius` de forma coherente (los extremos de la cruceta y del sello respetan `radius`).

---

## 5. Tipografías nuevas (autoalojadas, carga perezosa, reglas de v2 §6)

| Par | Títulos / números | Datos | Paquetes (@fontsource) |
|---|---|---|---|
| P11 | Big Shoulders Display 800/900 | Barlow 400/500/700 | `big-shoulders-display`, `barlow` |
| P12 | Saira Extra Condensed 700/800 | Saira 400/500/700 | `saira-extra-condensed`, `saira` |
| P13 | Alfa Slab One 400 | Barlow Semi Condensed 400/500/700 | `alfa-slab-one`, `barlow-semi-condensed` |

Verifica que cada paquete exista; si falta alguno, sustitúyelo por uno equivalente y anótalo en `DECISIONS.md`. Cifras de filas con `font-variant-numeric: tabular-nums`. Solo subsets `latin` + `latin-ext`, `font-display: swap`, woff2. Pila de fallback Unicode de v2.

---

## 6. Movimiento del editor (criterio `emil-design-eng`)

### 6.1 Principios que se aplican
1. **Primero la pregunta: ¿debería animarse?** Cambiar de plantilla es una acción **muy frecuente**: el movimiento debe ser casi imperceptible y nunca estorbar. Lo que se usa mucho se anima poco; lo que se ve una vez puede tener un poco más de intención.
2. **Rápido.** Respuestas a toques/clics ≤ 160 ms; paneles ≤ 220 ms; **nada pasa de 300 ms**.
3. **Curvas:** nunca `ease-in` en UI. Variables globales:
   ```css
   :root{
     --ease-out: cubic-bezier(0.23, 1, 0.32, 1);      /* entradas y respuestas */
     --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);  /* movimiento en pantalla */
   }
   ```
4. **Nada nace de `scale(0)`.** Las entradas empiezan en `scale(0.96)` + `opacity: 0`.
5. **Origen coherente:** los paneles que salen de un botón usan `transform-origin` en ese botón (no el centro).
6. **Solo `transform` y `opacity`** (skill `animation-performance`). Prohibido animar `width`, `height`, `top`, `left`, `margin` o `box-shadow`.
7. **Transiciones CSS (no keyframes) para estados**, para que sean interrumpibles: si el usuario cambia de plantilla a mitad de animación, la interfaz reacciona en el acto, sin saltos.
8. **Retroalimentación táctil:** todo botón y tarjeta pulsable: `:active { transform: scale(0.97); }` con 120 ms.
9. **Hover solo donde existe hover:** `@media (hover: hover) and (pointer: fine)`.
10. **`prefers-reduced-motion`:** se quita el desplazamiento y el escalado; se conserva el cambio de opacidad (≤ 120 ms).

### 6.2 Tabla de movimientos (completa: lo que no está aquí NO se anima)

| Dónde | Movimiento | Duración · curva |
|---|---|---|
| Tarjeta de miniatura (galería) | `:active` escala 0.97; hover eleva 2 px solo con puntero fino | 120 ms · `--ease-out` |
| Selección de plantilla | El borde de selección (2 px `accent`) cambia por opacidad; **sin** rebote ni escala | 160 ms · `--ease-out` |
| Vista previa al cambiar plantilla | **Crossfade** entre la imagen anterior y la nueva (dos capas, opacidad) | 140 ms · `--ease-out` |
| Cambio con teclado (flechas ↑↓ en la galería) | **Sin animación** (acción repetida): cambio instantáneo | — |
| Primera carga de la galería | Entrada escalonada de miniaturas: `translateY(8px)` + opacidad, **30 ms** entre tarjetas, máximo 10 tarjetas (las demás entran sin retardo) | 220 ms · `--ease-out` |
| Selector de fuente / color (popover) | `scale(0.96)`→`1` + opacidad, desde el botón que lo abre | 180 ms · `--ease-out` |
| Pestañas "General / Free Fire" | Indicador activo con `transform: translateX` (no animar ancho) | 200 ms · `--ease-in-out` |
| Revelado del podio en la vista previa | **Solo la primera vez que se renderiza una jornada**: las 3 tarjetas entran con `translateY(8px)` + opacidad, 40 ms de escalón | 220 ms · `--ease-out` |
| Botón "Exportar" | Escala 0.97 al presionar; estado "exportando" con cambio de texto (sin spinner animado con filtros) | 120 ms |
| Aviso "PNG listo" | Entra desde abajo 8 px + opacidad; sale solo con opacidad | 200 ms / 120 ms |

### 6.3 Reglas de aislamiento (críticas)
- **La imagen exportada NO tiene transiciones ni animaciones.** `ResultImage` no importa nada de movimiento. El nodo que se captura lleva `data-capture="true"` y existe una regla:
  ```css
  [data-capture="true"], [data-capture="true"] * {
    transition: none !important; animation: none !important;
  }
  ```
- Antes de exportar: esperar `document.fonts.ready` y `img.decode()` (v2 §8) **y** que el revelado del podio haya terminado o esté desactivado (la exportación nunca ocurre sobre el nodo a mitad de animación).
- Las miniaturas de la galería son renders reales de `ResultImage`; el movimiento se aplica al **contenedor** de la miniatura, jamás al contenido interno.
- Mismo input → mismo PNG; el movimiento no usa `Math.random()`.

### 6.4 "Detalles invisibles" que sí se piden
- Miniaturas con el mismo `border-radius` externo que la plantilla que muestran, para que el borde de selección no choque con la esquina.
- El crossfade no cambia el tamaño del contenedor (la proporción 4:5 se reserva de antemano: sin saltos de layout).
- Foco visible con teclado (`:focus-visible`) en cada tarjeta, sin animar el anillo.
- Texto de las pestañas y etiquetas con tracking amplio (v2 §9).

---

## 7. Galería y personalización

- Pestañas: **Todas · General · Free Fire** (las 3 de aquí aparecen con insignia de texto `FF`, sin íconos).
- Elegir una plantilla Free Fire **conserva** título, jornada, fecha, moderador, logo y fondo (v2 §7).
- Fuente, color de texto, color de acento, logo y fondo propios: **idéntico** al resto de plantillas; los overrides se guardan en `styleByTemplate[templateId]`.
- Fondo propio: *scrim* oscuro en `booyah` y `zona-roja`; claro en `kalahari`. Sin fondo propio: `default-background` en las oscuras; color plano + decoración en `kalahari`.

---

## 8. Plan de trabajo (no saltes pasos)

1. Leer las skills de la sección 1 (mínimo `emil-design-eng`, `animation-performance`, `animation-vocabulary`).
2. Añadir `chevrons` y `zone` a `Decor.tsx` y probarlas en Corona de forma temporal.
3. Añadir P11–P13 a `fonts.ts` con carga perezosa.
4. Cargar las 3 configuraciones y tokens en `templates.ts` (copiar tablas 3.1 y 3.2 tal cual) + `category`.
5. Galería con pestañas y movimiento de la sección 6.
6. Hoja de contactos y pruebas.
7. QA con `review-animations` y `break-ui`; documentar en `DECISIONS.md`.

---

## 9. Control de calidad

**Checklist por plantilla (11, 12, 13):**
- [ ] Configuración y tokens exactos de 3.1 y 3.2.
- [ ] Cambia ≥ 3 opciones frente a Corona y mantiene **todos** los bloques del esqueleto.
- [ ] Se reconoce como "la misma familia" en la hoja de contactos junto a Corona.
- [ ] Probada con 3, 10, 16 y 24 equipos; nombres largos/unicode (`ㅤ`, superíndices, kanji); sin logo; sin fondo; fondos muy claros y muy oscuros.
- [ ] `BOOYAH ×N` aparece solo con booyahs reales y nunca desborda con 24 equipos.
- [ ] Exporta PNG 2× correcto en 4:5, 9:16 y 1:1 (Chromium, Firefox, Safari).
- [ ] Contraste ≥ 4.5:1 en texto principal y ≥ 3:1 en elementos grandes, incluso con `accent`/`text` del usuario.
- [ ] Sin `backdrop-filter`, `mix-blend-mode`, `filter` CSS ni filtros SVG en el nodo exportado.
- [ ] Sin ningún activo oficial de Garena/Free Fire.

**Checklist de movimiento:**
- [ ] Ninguna animación > 300 ms; ninguna usa `ease-in`; ninguna parte de `scale(0)`.
- [ ] Solo `transform` y `opacity` (verificado en el perfilador: sin layout ni repintados grandes).
- [ ] Cambiar de plantilla varias veces seguidas y rápido no produce saltos ni cola de animaciones.
- [ ] Cambio por teclado instantáneo.
- [ ] Con `prefers-reduced-motion` no hay desplazamiento ni escala.
- [ ] El PNG exportado es idéntico con y sin animaciones activadas (comparar byte a byte o por diff de píxeles).

**Hoja de contactos:** `npm run contact-sheet` renderiza ahora las **13** plantillas en 4:5; deben leerse como una sola familia y ninguna como simple cambio de color.

**Definición de terminado:**
- [ ] Las 3 plantillas Free Fire funcionan, se ven como variantes de Corona y aparecen en la pestaña `Free Fire`.
- [ ] `chevrons` y `zone` implementadas; P11–P13 cargan bajo demanda (bundle inicial sin cambios).
- [ ] Movimiento del editor conforme a la sección 6, con la exportación completamente aislada.
- [ ] `README.md` con capturas de las 3 nuevas; `DECISIONS.md` con sustituciones de fuentes, skills no disponibles y decisiones de movimiento (nombradas con `animation-vocabulary`).
