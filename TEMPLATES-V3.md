# TEMPLATES-V3.md — Plantillas que se adaptan solas (rev. 2)

> **Qué es:** la especificación del aspecto de las imágenes exportadas. Esta revisión añade lo más importante: **las plantillas se ajustan solas al formato y a la cantidad de datos**, sin amontonarse, sin desbordar y sin dejar huecos muertos.
> **Relación con otros archivos:** complementa `TEMPLATESv2.md` y `TEMPLATES-FREEFIRE.md`. **Si hay contradicción en el aspecto de la imagen, manda este archivo.**
> **Reemplaza:** v2 §3 (medidas fijas y umbrales de densidad), v2 §4 (definición de cabecera, podio, lista y MVP) y la regla "conserva Corona exactamente como está" (Corona también se rediseña).
> **Conserva:** el esqueleto de datos (v2 §1), la arquitectura `ResultImage` + `TemplateConfig` (v2 §2), los tokens de color (v2 §5.2 y FF §3.2), la galería, la personalización (v2 §7) y las reglas de exportación (v2 §8).
> **No se toca:** la UI de la app (eso es `UI-REDESIGN.md`).

---

## 0. Diagnóstico: por qué se ven hechas por IA

Observado en las miniaturas actuales:

| Síntoma                                                                                 | Por qué delata a una IA                                                                  |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Cajas con borde fino dentro de cajas** (podio, MVP, lista, píldoras)                  | El contenedor es la respuesta por defecto a todo; no hay decisiones de composición       |
| **Texto diminuto en todos lados** (9–12 px de lienzo)                                   | En un teléfono la imagen se ve a ~⅓ de su tamaño y eso es ilegible: es relleno "técnico" |
| **Medidas fijas**: la misma plantilla con 3 equipos queda vacía y con 20 queda apretada | No hay un sistema que decida; solo una maqueta estática                                  |
| **Barra de progreso en cada fila**                                                      | Decoración tipo dashboard que no aporta nada que el número no diga                       |
| **Color por posición sin dato detrás** (top 5 en acento, resto en contorno)             | El color no significa nada: es adorno                                                    |
| **Píldoras de totales**                                                                 | Patrón de plantilla genérica; ocupa una fila entera                                      |
| **Todo del mismo peso**; nada manda                                                     | Sin protagonista: el ojo no sabe por dónde entrar                                        |
| **Mismo patrón simétrico en las 13**: solo cambia la paleta                             | Las variantes de v2 cambian el borde de la caja, no la composición                       |
| **Fondo verdoso con ilustración tenue genérica**                                        | Aspecto "stock"                                                                          |
| **Fuentes de moda** (Space Grotesk, Syne, Unbounded) como protagonistas                 | Muy vistas en proyectos generados                                                        |
| **Etiquetas en MAYÚSCULAS diminutas con tracking en cada bloque**                       | Tic repetido                                                                             |

**Objetivo:** que parezca una **ficha de resultados hecha por alguien del medio**: un protagonista claro, números grandes y legibles, cero cajas innecesarias, color que significa algo, y una composición que respira igual con 3 equipos que con 30.

---

## 1. Referencias investigadas y qué se toma de cada una

> Las búsquedas devolvieron **texto y descripciones, no imágenes**. **El agente debe abrir cada enlace, mirar los gráficos y guardar un moodboard solo con los enlaces en `docs/refs.md`** (no copiar imágenes al repositorio: son de terceros).

| Referencia                                                            | Qué muestra                                                                                                                                | Qué se aplica                                                                                                                                            |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Resultados reales de Free Fire (FFWS)** — Sportskeeda, Esportsverse | Tablas con eliminaciones, booyahs y puntos de bonus; MVP con su cifra de kills; narrativa de **diferencia con el líder** tras cada partida | Los datos ya son los correctos. Se añade la **diferencia con el 1.º** (dato derivado y real) en el podio; el MVP lleva los kills como cifra protagonista |
| **Plantilla de 16 equipos (esports)** — Boxout                        | Arte grande a un lado y tabla ordenada al otro                                                                                             | **Zona de arte** (§6.2): el fondo propio del usuario como foto protagonista                                                                              |
| **Plantilla de clasificación (atletismo)** — Boxout                   | Foto de atleta a la izquierda, tabla a la derecha                                                                                          | Misma idea: foto con intención + tabla sobria                                                                                                            |
| **Crítica de los gráficos de F1** — UX Collective                     | Pérdida de contraste, texto fino y pequeño, tamaños desiguales que rompen el equilibrio; atenuar el color no basta para la jerarquía       | Jerarquía por tamaño y alineación; **sin cursivas ni cifras decoradas**; formas de número uniformes; contraste mínimo                                    |
| **Torre de tiempos de F1** — RaceFans, recreación de Trovster         | Filas como bloques planos con posición, identidad y diferencia; lectura instantánea                                                        | Variante de lista `tower`: bloques planos separados por huecos                                                                                           |
| **Sistema de gráficos de la Premier League** — DixonBaxi, Design Week | Un solo sistema para tablas, estadísticas y perfiles; calidad editorial en tipografía y maquetación                                        | Refuerza la regla de familia y la prioridad de **tipografía sobre ornamento**                                                                            |
| **Marcador de la Premier League 2023-24** — Footy Headlines           | Colores de equipo como fondo de la posición                                                                                                | **No se aplica** (no hay colores ni escudos por equipo). Ver "Fuera de alcance"                                                                          |
| **Qué hace bueno a un overlay de LoL** — LHM                          | Distinguir tipos de números; el overlay "baja la voz" cuando el juego sube                                                                 | Principios §2.1 y §2.5: el total manda; kills/booyah/rank son secundarios                                                                                |
| **Tendencias de diseño de fútbol 24/25** — portafolio para Luton Town | Fotografía contundente, títulos fuertes, composiciones limpias                                                                             | Título dominante y foto como protagonista                                                                                                                |
| **Tipografía deportiva** — Font Alternatives                          | Cifras de marcador inequívocas y tabulares; tipografía neutra para datos junto a una expresiva para títulos                                | §4 (texto) y §7 (fuentes)                                                                                                                                |

**Fuera de alcance:** colores o escudos por equipo (requerirían datos nuevos del usuario). Si se quiere después, será una opción explícita; **nunca inventar colores a partir del nombre**.

---

## 2. Principios (aplican a las 13 plantillas)

1. **Responde en 3 segundos.** Quien mira la imagen sabe, sin esfuerzo: **quién ganó, por cuánto y quién fue el MVP.**
2. **Se adapta sola.** Formato y cantidad de datos cambian la composición (§3); nadie ajusta márgenes a mano.
3. **Nunca se amontona.** Hay pisos de texto, de altura de fila y de aire (§3.1, §4.1). Si no cabe, **se pagina**; no se comprime por debajo del piso.
4. **Nunca se ocultan datos.** Si algo no cabe, hay más imágenes, no menos columnas.
5. **Menos cajas.** Se separa con **filetes** de 1–2 px, **bloques planos** y espacio. Nunca una caja dentro de otra.
6. **El color significa algo.** Solo se colorea para codificar un dato: medalla (1.º/2.º/3.º), booyah > 0, resaltado del líder. Prohibido el color "por posición" sin dato.
7. **Un protagonista numérico.** El total del campeón es la cifra más grande de la imagen. Los demás números son tabulares y de tamaño fijo por rol (puntos > kills > booyah > rank).
8. **Jerarquía por tamaño y alineación**, no solo por atenuar el color. **Sin cursivas** ni cifras decoradas en datos. Las posiciones comparten la misma forma (mismo ancho y alineación).
9. **Retícula.** Cuadrícula de 8 px, columnas numéricas alineadas a la derecha con cifras tabulares, márgenes constantes.
10. **Foto con intención.** El fondo propio se muestra en una **zona de arte** a plena fuerza (§6.2), no como textura oscurecida debajo de todo.

---

## 3. Motor de maquetación auto-ajustable

**Idea central:** ninguna plantilla tiene alturas fijas. Existe **una función pura**, `solveLayout`, que recibe formato, configuración y datos, y devuelve **un plan** (qué bloque va en qué `y` con qué alto, qué tamaño de texto usa cada rol y cuántas páginas hacen falta). `ResultImage` solo **pinta ese plan**. Las medidas de v2 §3 pasan a ser el valor "ideal" de partida.

### 3.1 Garantías (todas verificables con pruebas, §10)

| #   | Garantía                                                                                                                                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| G1  | **No se amontona:** todo texto ≥ su piso (§4.1); fila de lista ≥ 44 px; el texto de una fila ocupa ≤ 64 % de su alto; entre bloques ≥ 12 px |
| G2  | **No desborda:** ningún bloque excede su `y/h`; ningún texto excede su columna ni el lienzo                                                 |
| G3  | **No hay huecos muertos:** el espacio sobrante se reparte (§3.5, paso 4); nunca queda un vacío grande al final                              |
| G4  | **No se ocultan datos:** si no caben, se crean más imágenes (§3.6)                                                                          |
| G5  | **Determinismo:** misma entrada → mismo plan → mismo PNG                                                                                    |
| G6  | **Un formato nuevo es un dato** (`formats.ts`), no código                                                                                   |

### 3.2 Entradas y salida

```ts
// layout/types.ts
export interface FormatSpec {
  id: '4:5' | '9:16' | '1:1';
  W: number;
  H: number; // 1080×1350 · 1080×1920 · 1080×1080
  inset: { t: number; r: number; b: number; l: number }; // margen + zona segura
  allowArt: boolean; // ¿admite zona de arte a sangre?
  forceMvp?: MvpV; // formato que impone una variante
  totals: 'full' | 'short'; // 'short' = equipos · kills · puntos
}

export interface LayoutInput {
  format: FormatSpec;
  config: TemplateConfig;
  teams: number; // n
  mvpCount: 0 | 1 | 2 | 3;
  has: { logo: boolean; title: boolean; moderator: boolean; userArt: boolean };
  data: TeamRowMeasures; // anchos de texto ya medidos (ver §4.2)
  measure: (text: string, role: Role, px: number) => number; // inyectada → la función es pura y testeable
}

export interface PagePlan {
  index: number;
  of: number; // 1..of
  blocks: { id: 'art' | 'header' | 'podium' | 'mvp' | 'list' | 'footer'; y: number; h: number }[];
  rows: [from: number, to: number]; // filas de lista de esta página
  rowH: number;
  tier: 'holgada' | 'media' | 'ajustada'; // derivada (§3.8)
  gap: number;
  sizes: Record<Role, number>; // px por rol de texto
  columns: { pos: number; k: number; b: number; r: number; total: number };
}
export type LayoutPlan = PagePlan[]; // 1 página o varias

export function solveLayout(input: LayoutInput): LayoutPlan; // sin DOM, sin aleatoriedad
```

### 3.3 Formatos (`formats.ts`: solo datos)

| id     | Lienzo      | `inset` (t / r / b / l) | `allowArt` | `forceMvp` | Totales |
| ------ | ----------- | ----------------------- | ---------- | ---------- | ------- |
| `4:5`  | 1080 × 1350 | 52 / 56 / 52 / 56       | sí         | —          | `full`  |
| `9:16` | 1080 × 1920 | 200 / 56 / 220 / 56     | sí         | —          | `full`  |
| `1:1`  | 1080 × 1080 | 52 / 56 / 52 / 56       | no         | `strip`    | `short` |

- **9:16:** los 200 px superiores y los 220 inferiores se dejan sin texto esencial (zona que las apps cubren con su interfaz en Stories/Reels/TikTok). **Verificar estas cifras con cada plataforma** y ajustarlas en `formats.ts`. La decoración y el arte sí pueden ocupar esas franjas.
- **1:1:** `split` baja a `left` (no hay espacio para las cifras 2×2) y no hay zona de arte; el fondo propio se usa a lienzo completo con scrim.
- Agregar un formato (p. ej. 3:4 o 16:9) = agregar una fila a esta tabla.

### 3.4 Bloques: mínimo · ideal · máximo (referencia 4:5; alturas en px lógicos)

`fv = clamp(alto útil ÷ 1246, 0.85, 1.6)`; los **máximos** de altura se multiplican por `fv` (en 9:16, `fv ≈ 1.2`). El alto útil es `H − inset.t − inset.b`.

| Bloque                               | Mín.              | Ideal | Máx.                              | Notas                                                                                                      |
| ------------------------------------ | ----------------- | ----- | --------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Cabecera (kicker + título + totales) | 150               | 180   | 210                               | La altura se **mide**: título en 1 o 2 líneas, totales en 1 o 2 líneas                                     |
| Cabecera con arte (`art: 'top'`)     | 220               | 260   | 300                               | A sangre; la placa va dentro (§6.2). En 9:16 el arte llega al borde y la placa empieza bajo la zona segura |
| Podio                                | 220 (`hero`: 240) | 260   | 300 con lista · **420** sin lista |                                                                                                            |
| MVP `strip`                          | 80                | 88    | 96                                |                                                                                                            |
| MVP `trio`                           | 104               | 112   | 130                               |                                                                                                            |
| Lista: encabezado                    | 28                | 28    | 28                                |                                                                                                            |
| Lista: filas                         | **44**            | 52    | 72                                | Alto por fila: `rowH`                                                                                      |
| Pie                                  | 30                | 30    | 30                                | Se elimina si no hay contenido                                                                             |
| Huecos entre bloques                 | 12                | 20    | 32 (× `fv`, máx. 48)              |                                                                                                            |

### 3.5 Algoritmo (por página)

1. **Preparar.** Se **eliminan los bloques sin contenido** (sin logo, sin MVP, sin moderador, sin título) y su espacio se redistribuye. `podiumN = min(3, n)`; `rest = n − podiumN`; si `rest = 0`, no hay bloque de lista. El formato puede imponer variante de MVP o de cabecera (§3.3).
2. **Altura útil** `U = H − inset.t − inset.b` (el arte a sangre puede ocupar además las franjas del `inset`).
3. **Escalera de degradación** (se detiene en el **primer** nivel donde todo cabe):
   - **N0** — todo en su altura ideal.
   - **N1** — huecos al mínimo (12).
   - **N2** — podio y arte al mínimo.
   - **N3** — cabecera al mínimo.
   - **N4** — filas al piso (44) y MVP `trio` → `strip`.
   - **N5** — aún no cabe: **paginar** (§3.6). **Nunca** se baja de los pisos.
4. **Reparto del sobrante** (si queda espacio después de elegir el nivel), en este orden hasta el máximo de cada bloque: **filas → podio → cabecera/arte → MVP → huecos**. Si aún sobra (pocos equipos): el bloque central (podio + lista + MVP) **se centra verticalmente** entre la cabecera (arriba) y el pie (abajo). No se deja un vacío al final.
5. **Tamaños de texto por rol**, derivados de las alturas finales (§4.1). Menos filas → filas más altas → texto más grande.
6. **Medir** nombres, título y totales (§4.2). Si algo no cabe en horizontal: se aplica el ajuste de §4.2 y, si hace falta, se aumenta la altura de ese bloque y se **repiten los pasos 3–5** (máx. 3 iteraciones; el resultado es siempre el mismo para la misma entrada).
7. **Red de seguridad:** `overflow: hidden` en cada bloque. Si alguna vez recorta algo, `check-layout` falla (no debe pasar nunca).

### 3.6 Paginación

Se activa **solo** cuando N4 no basta. Cantidad de páginas = la menor `P` que permite colocar todas las filas con `rowH ≥ 44`.

- **Página 1:** cabecera completa (con arte si aplica), podio, MVP y las primeras filas.
- **Páginas 2…P:** cabecera compacta (kicker + título en una línea, ≈ 110 px, sin arte ni totales), solo lista y pie. Capacidad mucho mayor (≈ 20+ filas a 4:5).
- **Reparto parejo:** se busca el **mayor `rowH` común** a todas las páginas y se reparten las filas de modo que ninguna página quede casi vacía (diferencia máxima de 1 fila entre páginas con el mismo `rowH`).
- **Etiqueta:** el kicker pasa a `JORNADA 1 · PARTE 1/2` (a la izquierda) y la fecha queda a la derecha. El pie se repite en todas.
- El MVP va **solo en la página 1** (aunque `mvpPlacement` sea `after-list`).
- La galería y la vista previa muestran la página 1; "Descargar PNG" entrega todas (ZIP si P > 1).

### 3.7 Casos límite (el motor los resuelve; no hay "modos" aparte)

| Caso                                                  | Comportamiento                                                                                                                                           |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **n = 1**                                             | Solo 1.º, grande y centrado (podio hasta 420 × `fv`), sin lista. El grupo central se centra verticalmente                                                |
| **n = 2**                                             | Podio de 2 (stepped: 2 · 1 sin 3.º; el grupo se centra; `row`: 1 · 2 a ancho completo; `hero`: el 1.º ocupa todo el ancho y el 2.º va debajo). Sin lista |
| **n = 3**                                             | Podio completo; **sin lista** (la lista vacía no se dibuja). Sobrante → crecimiento del podio y centrado                                                 |
| **4–10**                                              | Un solo bloque de lista, filas hasta 72 px si sobra altura                                                                                               |
| **11–≈17**                                            | Lista en `rowH` bajando hasta 44; el motor decide cuándo basta (no hay umbral fijo)                                                                      |
| **Más de lo que cabe**                                | Paginación (§3.6)                                                                                                                                        |
| **Sin logo**                                          | El título ocupa el espacio del logo (parte del borde izquierdo); la cabecera se acorta                                                                   |
| **Sin título**                                        | Se omite el bloque del título; la cabecera se reduce al kicker y los totales                                                                             |
| **Sin moderador**                                     | El pie muestra solo `SALA N · BOOYAH …`; sin `[placeholder]`                                                                                             |
| **Sin fondo propio con `art: 'top'`**                 | Numeral gigante de la jornada (§6.2)                                                                                                                     |
| **MVP con < 3 jugadores**                             | Las columnas se reparten el ancho entre los que haya (1 o 2). Sin MVP → el bloque se elimina                                                             |
| **Empate en total 1.º/2.º**                           | Se oculta la "diferencia con el 1.º"                                                                                                                     |
| **Nombres larguísimos / `ㅤ` / kanji / superíndices** | `fitText` (§4.2); un nombre de solo caracteres invisibles se renderiza con su ancho real y no rompe la fila                                              |
| **n = 0**                                             | No se exporta (la UI lo impide)                                                                                                                          |

### 3.8 Densidad derivada

La densidad **ya no es un interruptor por número de equipos**: se deduce del `rowH` resultante.

| Nivel      | `rowH` | Efecto (nunca cambia el contenido)                                       |
| ---------- | ------ | ------------------------------------------------------------------------ |
| `holgada`  | ≥ 56   | Ornamento completo; `tower` con huecos de 4 px                           |
| `media`    | 48–55  | Igual                                                                    |
| `ajustada` | 44–47  | Huecos de `tower` a 2 px; decoración con menos opacidad; filetes de 1 px |

### 3.9 Rendimiento y determinismo

- `solveLayout` es **pura** (sin DOM): se prueba con unit tests y una función `measure` falsa.
- En la app, `measure` usa `canvas.measureText` **después de `document.fonts.ready`**; **no** se usan `ResizeObserver` ni mediciones del DOM visibles al usuario.
- El plan se **memoiza** con un hash de (formato, config, datos). La galería usa el mismo motor con datos de ejemplo; cambiar de plantilla o de formato recalcula en < 5 ms.
- Sin `Math.random()` ni dependencia del tamaño de pantalla: el resultado depende solo de los datos.

---

## 4. Texto: tamaños, ajuste y formato

### 4.1 Roles de texto (lienzo de 1080 px de ancho)

El tamaño de cada rol **se calcula** a partir de la altura que le asigna el motor y se limita entre un **piso** (duro: nunca se baja) y un **techo**. Con `rowH = 52` los valores coinciden con los de la referencia.

| Rol                                      | Fórmula                   | Piso                    | Techo |
| ---------------------------------------- | ------------------------- | ----------------------- | ----- |
| Nombre en lista                          | 0.58 × `rowH`             | **28**                  | 42    |
| Total en lista                           | 0.66 × `rowH`             | **32**                  | 46    |
| Datos secundarios (K, B, R)              | 0.50 × `rowH`             | **24**                  | 32    |
| Etiquetas (`KILLS`, `MODERADOR`, kicker) | 0.42 × `rowH`             | **22**                  | 26    |
| Podio: nombre                            | 0.16 × alto del podio     | **36**                  | 52    |
| Podio: total del 1.º                     | 0.52 × alto del podio     | **96**                  | 170   |
| Podio: total del 2.º y 3.º               | 0.27 × alto del podio     | **56**                  | 80    |
| MVP: kills                               | 0.50 × alto del MVP       | **40**                  | 56    |
| Título                                   | ajuste a una línea (§4.2) | **56** (48 en 2 líneas) | 88    |
| Pie                                      | = etiquetas               | **22**                  | 26    |

Reglas: sin cursivas en datos; cifras con `font-variant-numeric: tabular-nums`; etiquetas en mayúsculas con tracking moderado y **solo** etiquetas (nunca frases).

### 4.2 Ajuste de texto (`fitText`)

- **Medición con `canvas.measureText`** (misma fuente, peso y tracking que el render). Búsqueda binaria del tamaño en pasos de 1 px entre el tamaño del rol y su piso.
- **Nombres en la lista:** una línea. Si a su piso no caben, se **trunca con elipsis por grafema** (`Intl.Segmenter`, para no cortar emojis, kanji ni superíndices) y se registra un aviso en consola de desarrollo. El nombre completo sigue visible en el podio si el equipo está en el top 3.
- **Nombres en el podio:** hasta **2 líneas** (corte equilibrado en el espacio más cercano al centro); piso 30 px.
- **Título:** primero a una línea (88 → 56 px); si no cabe, **2 líneas equilibradas** (64 → 48 px); si aún no cabe, elipsis en la segunda línea.
- **Línea de totales:** si no cabe en una línea a 26 px, **pasa a 2 líneas** y la cabecera crece (la mide el motor); no se reduce por debajo del piso.
- **Columnas numéricas:** el ancho de cada una se calcula con el dato **más ancho** (`measureText` del valor máximo) con un mínimo de 64 px (96 px para el total). La columna del nombre recibe el resto.
- Todo `fitText` ocurre **antes** de renderizar; en pantalla nunca se ve "saltar" el texto.

### 4.3 Formato de los datos (texto "de revista", no de volcado de log)

- **Plurales correctos** con `Intl.PluralRules`: `1 equipo` / `10 equipos`, `1 sala` / `2 salas`, `1 booyah` / `2 booyahs`, `1 kill` / `86 kills`, `1 punto` / `143 puntos`.
- **Números** con `Intl.NumberFormat` del idioma de la app (`es-MX` por defecto): `1,234`; sin separador por debajo de 10 000 en las columnas de la lista.
- **Fecha:** `12 OCT 2026` (mes de 3 letras en mayúsculas, sin punto final, aunque el idioma lo añada).
- **Ordinales** según `numerals`: `04` · `4` · `#4` · `4.º`; en el podio `1 2 3` · `#1 #2 #3` · `1.º 2.º 3.º`.
- **Nombres de equipos y jugadores:** exactamente como vienen (no cambiar mayúsculas ni minúsculas, no "limpiar"). Fallback de fuente con cobertura Unicode (v2 §6).
- **Comillas y guiones tipográficos** en textos fijos; sin signos de exclamación.
- Nunca texto de relleno en la exportación (los `[placeholders]` solo existen en el editor).

---

## 5. Cambios en el sistema

```
src/features/templates/
├─ layout/
│  ├─ solveLayout.ts      # función pura (§3)
│  ├─ formats.ts          # FormatSpec[] (§3.3)
│  ├─ blocks.ts           # min/ideal/max por bloque (§3.4)
│  ├─ roles.ts            # fórmulas, pisos y techos (§4.1)
│  ├─ fitText.ts          # medición y ajuste (§4.2)
│  └─ __tests__/          # pruebas de propiedades (§10)
├─ ResultImage.tsx        # pinta el plan; sin lógica de medidas
└─ ...(resto igual que v2)
```

```ts
// types.ts (cambios respecto a v2)
export type ListV = 'ledger' | 'dots' | 'tower'; // bars→ledger, chips→tower
export type MvpV = 'trio' | 'strip'; // cards→trio
export type ArtV = 'top' | 'none'; // NUEVO

export interface TemplateConfig {
  // ...todo lo de v2 y FF...
  list: ListV;
  mvp: MvpV;
  art: ArtV;
}
```

- **Migración:** `bars → ledger`, `chips → tower`, `cards → trio`. Se borra el código de barras de progreso, tarjetas con borde y píldoras.
- Las **secciones leen el plan**, no calculan alturas. Cualquier número fijo en un componente (p. ej. `height: 300`) es un error de revisión.
- Los totales se muestran como **línea de texto** (todas las cabeceras salvo `split`) o como **cifras 2×2** (`split`).
- `Decor.tsx` no cambia (v2 + FF), salvo la regla de §6.7.
- Se mantiene "agregar una plantilla = agregar un objeto en `templates.ts`" y se añade "agregar un formato = agregar un objeto en `formats.ts`".

---

## 6. Definición de secciones (todas adaptables)

Las alturas y los tamaños los fija el motor (§3, §4); aquí se define la **forma**.

### 6.1 Cabecera

- **Kicker:** `JORNADA 1` — filete fino que ocupa el espacio — `12 OCT 2026` (con `PARTE 1/2` si hay varias páginas). Mono 500, tracking .14 em.
- **Título:** fuente de títulos, ajustado según §4.2.
- **Totales (línea):** `10 equipos · 1 sala · 86 kills · 143 puntos · 1 booyah`: cifras en `text` / 600, palabras en `muted`. En `1:1`, versión corta (`equipos · kills · puntos`). Sin píldoras.

Variantes:

- **`left`**: logo a la izquierda (≈ 96 px; sin logo, el título ocupa su lugar); a su derecha kicker y título; totales debajo a todo el ancho.
- **`center`**: logo centrado arriba (≈ 80 px); kicker, título y totales centrados.
- **`split`**: izquierda logo + kicker + título; derecha **cifras grandes 2×2** (64 px; etiqueta en el rol de etiquetas). Sin línea de totales. En `1:1` baja a `left`.
- **`banner`**: franja de ancho completo en `accent` con el título (`readableOn(accent)`); logo a la izquierda sobre la franja; kicker encima; totales en línea debajo.

### 6.2 Zona de arte (`art: 'top'`; solo si el formato lo permite y la página es la 1)

Bloque **a sangre** (borde a borde) en la parte alta, con la altura que asigne el motor. La cabecera va en una **placa sólida** (`bg`, sin transparencia) que cubre su parte inferior, tipo _lower third_. En 9:16 el arte llega al borde superior y la placa empieza bajo la zona segura.

- **Con fondo propio:** imagen en `object-fit: cover`, **a plena fuerza (sin scrim ni opacidad)**. El borde inferior del bloque se corta con una **diagonal** (≈ 28 px) dibujada como **polígono SVG en `bg` sobre la foto** (nada de `clip-path` ni máscaras). Fuera del bloque, el fondo es **color plano `bg`**.
- **Sin fondo propio:** un **numeral gigante de la jornada** (`J1`, `1`, `FINAL`, lo que haya en el campo) en la fuente de títulos, tamaño ≈ 2.2 × el alto del bloque, color `surface`, **recortado por el borde** y alineado abajo-izquierda. Solo texto: sin filtros ni degradados.
- Con `art: 'top'` no se dibuja decoración sobre el bloque.
- Con `art: 'none'` (o en `1:1`): v2 §7 (fondo propio a lienzo completo con scrim; sin fondo propio → color plano `bg` + decoración).

### 6.3 Podio (sin tarjetas con borde)

Posición (con `numerals`), nombre, `KILLS · BOOYAHS`, total. 1.º en `accent2`, 2.º plata, 3.º bronce. El 2.º y el 3.º muestran además la **diferencia con el 1.º** (`a 3 pts del 1.º`, rol de etiquetas, `muted`; oculta si empatan). Con menos de 3 equipos: §3.7.

- **`stepped`**: orden visual 2 · 1 · 3; alturas relativas ≈ **83 % / 100 % / 69 %** del alto del podio. Nombre y `K · B` **sobre** el escalón; el escalón es un **bloque plano**: el del 1.º relleno `accent2` con texto `readableOn(accent2)`; los del 2.º y 3.º relleno `surface` con una franja superior de 6 px en plata/bronce. Dentro: posición y total.
- **`row`**: orden 1 · 2 · 3, misma altura, separados por **filetes verticales de 2 px** (`border`), sin caja. El 1.º con `flex: 1.4` y franja superior de 6 px en `accent2`. Contenido apilado: posición (color de medalla) · nombre · `K · B` · total.
- **`hero`**: a la izquierda una **placa** (≈ 52 % del ancho, alto completo) con franja superior de 6 px en `accent2`: posición · nombre · `K · B` · **total enorme en `accent2`**. A la derecha, 2.º y 3.º apilados (50 % del alto cada uno), separados por un filete horizontal; cada uno: posición · nombre · total a la derecha.

### 6.4 Lista (posiciones 4 en adelante)

Cabecera de columnas en el rol de etiquetas. **Sin filas alternadas ni barras de progreso.** Los ceros van en `muted`; **un booyah > 0 se destaca** (`accent2`, peso 700): el color codifica un dato. Anchos de columna según §4.2.

- **`ledger`** _(libro de registro)_: filas de `rowH` separadas por un **filete de 1 px**. Columnas: `#` · `EQUIPO` (flexible) · `KILLS` · `BOOY` · `RANK` · `TOTAL`. Numéricas alineadas a la derecha.
- **`tower`** _(torre de tiempos)_: filas como **bloques planos** separados por **huecos** (4 px, o 2 en `ajustada`). Bloque de posición (`surface`) · nombre · `K` `B` `R` · bloque de total (`surface`). **Franja de 6 px a la izquierda en `accent2` solo si el equipo tiene booyah** (dato).
- **`dots`** _(puntos guía)_: `# NOMBRE ......... TOTAL`, con borde punteado de 2 px (`muted`) entre el bloque nombre + `K · B · R` (rol de datos secundarios, `muted`) y el total. Sin filas alternadas.

`radius` se aplica solo a los **bloques planos** (podio, `tower`, logo).

### 6.5 MVP (top 3 por kills)

- **`trio`** _(sin cajas)_: etiqueta `MVP · KILLS` con un filete que ocupa el espacio; debajo, **columnas separadas por filetes verticales** (tantas como jugadores, §3.7). Cada una: **kills grandes** (medalla: `accent2` / plata / bronce) a la izquierda; jugador y equipo (`muted`) apilados a la derecha.
- **`strip`**: una sola franja: etiqueta `MVP · KILLS` a la izquierda y los jugadores en línea, cada uno con kills, jugador y equipo debajo, separados por filetes verticales.
- `after-list` / `before-list` como v2 (en varias páginas, siempre en la página 1).

### 6.6 Pie

Filete de 1 px y, debajo, una línea en el rol de etiquetas: `MODERADOR · NOMBRE` a la izquierda y `SALA N · BOOYAH …` a la derecha. Sin moderador, solo el lado derecho (§3.7).

### 6.7 Decoración

Reglas de v2/FF más una: **la decoración nunca pasa por debajo de texto de datos**. Si lo hace, se mueve a una esquina libre o baja su opacidad hasta que el contraste del texto siga ≥ 4.5:1. Puede **sangrar** por el borde del lienzo (queda recortada). En 9:16 puede ocupar las franjas de zona segura.

### 6.8 Fondo por defecto

**Se retira `default-background.png` como fondo por defecto.** Sin fondo propio: color plano `bg` + decoración (+ numeral gigante si `art: 'top'`). El archivo se conserva en `assets/` por si el usuario lo elige en el editor.

---

## 7. Catálogo revisado (13 plantillas) y fuentes

Se mantienen los `id`, los **tokens de color** y los temas. Se actualizan las variantes (toda la maquetación pasa por el motor).

| #   | id         | tema   | cabecera | podio   | lista  | MVP   | pos. MVP | decoración | radio | num.    | arte | fuentes |
| --- | ---------- | ------ | -------- | ------- | ------ | ----- | -------- | ---------- | ----- | ------- | ---- | ------- |
| 1   | corona     | oscuro | left     | stepped | ledger | trio  | after    | rings      | 14    | pad     | none | P1′     |
| 2   | brasa      | oscuro | banner   | stepped | ledger | trio  | before   | slashes    | 4     | pad     | none | P2      |
| 3   | medianoche | oscuro | center   | row     | ledger | strip | after    | arcs       | 8     | plain   | top  | P3′     |
| 4   | marfil     | claro  | left     | hero    | dots   | strip | after    | brackets   | 4     | ordinal | none | P4      |
| 5   | pista      | oscuro | split    | row     | tower  | trio  | before   | stripes    | 0     | pad     | none | P5      |
| 6   | granate    | oscuro | center   | stepped | dots   | trio  | after    | rings      | 8     | plain   | top  | P6      |
| 7   | cobalto    | oscuro | banner   | row     | tower  | strip | before   | slashes    | 0     | pad     | none | P7      |
| 8   | selva      | oscuro | left     | hero    | tower  | trio  | after    | dots       | 8     | plain   | top  | P8      |
| 9   | hielo      | claro  | split    | stepped | ledger | strip | before   | grid       | 8     | hash    | none | P9      |
| 10  | ambar      | oscuro | banner   | row     | dots   | strip | after    | scan       | 0     | pad     | none | P10     |
| 11  | booyah     | oscuro | banner   | hero    | tower  | strip | before   | chevrons   | 0     | pad     | top  | P11     |
| 12  | zona-roja  | oscuro | split    | row     | ledger | trio  | after    | zone       | 4     | plain   | none | P12     |
| 13  | kalahari   | claro  | center   | stepped | dots   | trio  | after    | slashes    | 8     | ordinal | top  | P13     |

Cada plantilla sigue cambiando **≥ 3 opciones** respecto a Corona. Cuando el motor degrada (p. ej. `trio` → `strip` en N4, `split` → `left` en 1:1), el resultado sigue siendo "esa plantilla", solo con menos espacio.

**Cambios de tipografía (las más gastadas):**

| Par              | Antes                      | Ahora                                                                   | Paquetes (@fontsource)                         |
| ---------------- | -------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------- |
| P1′ (Corona)     | Syne / Space Grotesk       | **Sofia Sans Extra Condensed 700/800** / **Libre Franklin 400/500/700** | `sofia-sans-extra-condensed`, `libre-franklin` |
| P3′ (Medianoche) | Unbounded / Hanken Grotesk | **League Gothic 400** / Hanken Grotesk 400/500/700                      | `league-gothic`, `hanken-grotesk`              |

Verifica que cada paquete exista; si falta alguno, sustitúyelo por uno equivalente (evitar Inter, Poppins, Montserrat, Roboto) y anótalo en `DECISIONS.md`. Cifras tabulares siempre; en totales y posiciones, sin cursivas. **Las fuentes deben estar cargadas antes de calcular el plan** (`document.fonts.ready`), porque el motor mide con ellas.

---

## 8. Skills (leer el `SKILL.md` antes de escribir código)

| Orden | Skill                        | Uso aquí                                                                                                        |
| ----- | ---------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 1     | `redesign-existing-projects` | Auditar las 13 plantillas actuales (capturas en `docs/tpl-before/`) y rediseñar sin romper datos ni exportación |
| 2     | `design-taste-frontend`      | Criterio de jerarquía, ritmo y qué eliminar                                                                     |
| 3     | `high-end-visual-design`     | Microtipografía y acabado fino de números, filetes y bloques                                                    |
| 4     | `minimalist-ui`              | Base de "menos cajas, más filetes" en `ledger` y `dots`                                                         |
| 5     | `industrial-brutalist-ui`    | Carácter para `booyah`, `pista`, `cobalto` y `ambar`                                                            |
| 6     | `brandkit`                   | Tokens de rol y piso/techo (§4.1) en un solo lugar (`roles.ts`)                                                 |
| 7     | `break-ui`                   | **QA:** romper el motor (datos extremos, formatos, unicode, fondos)                                             |
| 8     | `full-output-enforcement`    | No dejar nada a medias                                                                                          |

`emil-design-eng` y las skills de animación **no aplican** a la imagen exportada (es estática); solo rige el movimiento de la galería (`TEMPLATES-FREEFIRE.md` §6). Si falta alguna skill, anotarlo en `DECISIONS.md`.

---

## 9. Plan de trabajo (no saltes pasos)

1. **Auditoría:** `npm run contact-sheet` con el estado actual → `docs/tpl-before/`; guardar `docs/refs.md` tras revisar los enlaces de §1.
2. **Motor primero, sin pintar nada:** `formats.ts`, `blocks.ts`, `roles.ts`, `solveLayout.ts` con sus **pruebas de propiedades** (§10). El motor debe pasar las pruebas **antes** de tocar los componentes.
3. **`fitText`** con `measureText` y `Intl.Segmenter`; pruebas con nombres extremos.
4. **Secciones que leen el plan**, en este orden: Cabecera (y zona de arte) → Podio → Lista (`ledger`, `tower`, `dots`) → MVP → Pie. Empezar por **Corona**.
5. **Paginación** (ZIP al descargar; página 1 en la vista previa).
6. **Migración de config** (`bars→ledger`, `chips→tower`, `cards→trio`) y carga de la tabla de §7 + fuentes nuevas.
7. **QA:** matriz de §10, `break-ui`, prueba de teléfono, prueba de 3 segundos y hoja de contactos de las 13.
8. **Documentación:** `README.md` (capturas antes/después) y `DECISIONS.md`.

---

## 10. Control de calidad

### 10.1 Pruebas del motor (`npm run test:layout`, sin navegador)

Con `measure` falsa y barrido de: `n ∈ {1, 2, 3, 4, 5, 8, 10, 12, 14, 15, 18, 24, 32, 48}` × 3 formatos × las 13 configs × (con/sin logo, con/sin título, MVP 0–3, con/sin arte). Para **cada** plan se comprueba:

- [ ] Suma de alturas + huecos + insets = alto del lienzo (**G2**: sin solape ni desborde), salvo el sobrante repartido (**G3**).
- [ ] Ningún rol por debajo de su piso; `rowH ≥ 44` y texto ≤ 64 % de la fila (**G1**).
- [ ] Todas las filas aparecen una vez y en orden; ningún dato oculto (**G4**).
- [ ] Páginas con diferencia ≤ 1 fila cuando tienen el mismo `rowH`.
- [ ] Mismo input → mismo JSON de plan (**G5**).
- [ ] Un formato nuevo añadido solo en `formats.ts` produce planes válidos (**G6**).
- [ ] Tiempo de resolución < 5 ms por plan.

### 10.2 Pruebas de render (`npm run check-layout`, navegador)

Renderiza el nodo exportado (3, 10, 18 y 48 equipos; 4:5, 9:16, 1:1) y **falla** si encuentra: `font-size` bajo el piso de su rol, texto con contraste < 4.5:1 (< 3:1 si ≥ 40 px), texto que excede su columna, contenido recortado por la red de seguridad, o franjas de zona segura 9:16 con texto esencial.

### 10.3 Pruebas humanas

- **Prueba de teléfono:** cada plantilla en 4:5 con 10 equipos, vista en un teléfono real (o a 390 px de ancho). Se lee **todo**, incluida la columna de kills, sin zoom.
- **Prueba de los 3 segundos:** mostrar la imagen 3 segundos a 3 personas ajenas: _¿quién ganó, por cuánto y quién es el MVP?_ Si fallan, revisar §2.
- **Prueba de la mano humana:** tapar el logo y mostrar la hoja de contactos; nadie debe decir "parece hecho por IA". Si lo dicen, revisar §0.
- **Prueba de los extremos:** la misma plantilla con 3 y con 30 equipos en 4:5 y en 9:16: las dos deben verse **intencionadas**, no vacía la primera ni apretada la segunda.

### 10.4 Checklist por plantilla

- [ ] En `templates.ts` con la configuración exacta de §7 y los tokens de v2 §5.2 / FF §3.2.
- [ ] Todos los bloques del esqueleto y todos los datos (v2 §1); sin píldoras, barras de progreso ni cajas dentro de cajas.
- [ ] Ninguna altura fija en componentes: todo sale del plan.
- [ ] Probada con nombres largos/unicode (`ㅤ`, superíndices, kanji), sin logo, sin fondo propio y con fondos muy claros y muy oscuros.
- [ ] `art: 'top'`: con foto propia (sin scrim) y sin ella (numeral gigante); la placa siempre legible.
- [ ] El color solo aparece donde codifica un dato (medalla, booyah, líder).
- [ ] Plurales, números y fechas según §4.3.
- [ ] Exporta PNG 2× correcto (Chromium, Firefox, Safari); sin `backdrop-filter`, `mix-blend-mode`, `filter`, `clip-path` ni máscaras en el nodo exportado.
- [ ] Contraste ≥ 4.5:1 en texto y ≥ 3:1 en elementos grandes, incluso con `accent`/`text` del usuario.

### 10.5 Definición de terminado

- [ ] `solveLayout` con todas las pruebas de §10.1 en verde y `check-layout` en verde.
- [ ] Las 13 plantillas se adaptan solas a 4:5, 9:16 y 1:1 y a cualquier cantidad de equipos, con paginación cuando haga falta.
- [ ] Reconocibles como una familia y **ninguna** como un cambio de color de otra.
- [ ] Pasan las pruebas de teléfono, 3 segundos, mano humana y extremos.
- [ ] Código de barras de progreso, tarjetas con borde, píldoras y alturas fijas eliminado; `default-background` ya no es el fondo por defecto.
- [ ] `README.md` con capturas antes/después; `DECISIONS.md` con sustituciones de fuentes, skills ausentes, cifras de zona segura verificadas y decisiones de maquetación.

---

## Fuentes consultadas

- Boxout Sports — [Plantilla de 16 equipos (esports)](https://boxoutsports.com/graphics/esports/16-team-standings), [Clasificación (atletismo)](https://boxoutsports.com/graphics/track-cross-country/standings)
- Sportskeeda — [FFWS 2024 Spring Indonesia](https://sportskeeda.com/free-fire/news-free-fire-world-series-2024-spring-indonesia-winners-overall-standings-qualified-teams-ffws-sea), [FFWS 2022 Sentosa](https://sportskeeda.com/free-fire/news-attack-all-around-crowned-champions-free-fire-world-series-2022-sentosa), [FFWS 2023 Knockout](https://sportskeeda.com/free-fire/news-free-fire-world-series-ffws-knockout-day-3-overall-standings-highlights)
- Esportsverse — [FFWS Global Finals 2025](https://www.esportsverse.in/tournaments/free-fire/free-fire-world-series-global-finals-2025)
- UX Collective — [Crítica de los gráficos de TV de F1](https://uxdesign.cc/a-design-perspective-on-the-new-and-frustrating-formula-one-tv-graphics-ec0a35c3a761)
- RaceFans — [Gráficos de transmisión en el automovilismo](https://www.racefans.net/?p=478947); Trovster — [Recreación de la torre de tiempos](https://www.trovster.com/playground/f1-timing-tower)
- Design Week — [DixonBaxi y la Premier League](https://www.designweek.co.uk/issues/15-21-august-2016/dixonbaxi-looked-give-premier-league-brand-new-life-screen/); It's Nice That — [Field of Play](https://www.itsnicethat.com/news/dixonbaxi-premier-league-field-of-play-120816)
- Footy Headlines — [Marcador de la Premier League 23-24](https://www.footyheadlines.com/2023/08/premier-league-broadcast-design-launched.html)
- LHM — [Qué hace bueno a un overlay de LoL](https://lhm.gg/blog/what-makes-a-good-lol-broadcast-overlay)
- Luton Town FC (portafolio) — [Tendencias de diseño de fútbol](https://mirsab.myportfolio.com/luton-town-fc-design-task)
- Font Alternatives — [Tipografía para deportes](https://fontalternatives.com/best-fonts-for/sports/)
