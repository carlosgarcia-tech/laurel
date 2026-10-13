# TEMPLATES-V3.md — Rediseño visual de las plantillas (menos "IA", más ficha de torneo)

> **Qué es:** corrección del aspecto de las imágenes exportadas. Se apoya en investigación de referencias reales (esports, Free Fire, fútbol, F1, transmisiones deportivas), listadas en §1.
> **Relación con los otros archivos:** complementa `TEMPLATESv2.md` y `TEMPLATES-FREEFIRE.md`. **Si hay contradicción en el aspecto de la imagen, manda este archivo.**
> **Reemplaza:** v2 §3 (tamaños y geometría), v2 §4 (definición de cabecera, podio, lista, MVP), la regla "conserva Corona exactamente como está" (Corona también se rediseña) y el §9 de v2 donde choque con lo de aquí.
> **Conserva:** el esqueleto y los datos (v2 §1), la arquitectura `ResultImage` + `TemplateConfig` (v2 §2), los tokens de color de v2 §5.2 y FF §3.2 (salvo lo indicado), la galería, la personalización (v2 §7) y las reglas de exportación (v2 §8).
> **No se toca:** la UI de la app (eso es `UI-REDESIGN.md`).

---

## 0. Diagnóstico: por qué se ven hechas por IA

Observado en las miniaturas actuales de la galería:

| Síntoma | Por qué delata a una IA |
|---|---|
| **Cajas con borde fino dentro de cajas** (podio, MVP, lista, píldoras) | El contenedor es la respuesta por defecto a todo; no hay decisiones de composición |
| **Texto diminuto en todos lados** (etiquetas y columnas de 9–12 px de lienzo) | En un teléfono la imagen se ve a ~⅓ de su tamaño: eso queda ilegible. Es relleno "técnico" |
| **Barra de progreso en cada fila** | Decoración tipo dashboard que no aporta información que el número no dé |
| **Color por posición sin dato detrás** (top 5 en acento, resto en contorno) | El color no significa nada: es adorno |
| **Píldoras de totales** | Patrón de plantilla genérica; ocupa una fila entera |
| **Todo del mismo peso**; nada manda | Sin protagonista: el ojo no sabe dónde entrar |
| **Mismo patrón simétrico en las 13**: solo cambia la paleta | Las variantes de v2 cambian el borde de la caja, no la composición |
| **Fondo verdoso con ilustración tenue genérica** | Aspecto "stock" |
| **Fuentes de moda** (Space Grotesk, Syne, Unbounded) como protagonistas | Muy vistas en proyectos generados |
| **Etiquetas en MAYÚSCULAS diminutas con tracking en cada bloque** | Tic repetido |

**Objetivo:** que parezca una **ficha de resultados de torneo hecha por alguien del medio**: un protagonista claro, números grandes y legibles, cero cajas innecesarias, color que significa algo, y una foto/arte del usuario tratado con intención.

---

## 1. Referencias investigadas y qué se toma de cada una

> Las búsquedas devolvieron **texto y descripciones, no imágenes**. **El agente debe abrir cada enlace de la columna "Fuente", mirar los gráficos y guardar un moodboard solo con los enlaces en `docs/refs.md`** (no copiar imágenes al repo: son de terceros).

| Referencia | Qué muestra | Qué se aplica |
|---|---|---|
| **Resultados reales de Free Fire (FFWS)** — Sportskeeda, Esportsverse | Tablas de puntos totales con eliminaciones, booyahs y puntos de bonus; MVP del torneo con su cifra de kills; títulos como "Predator" al máximo eliminador; narrativa de **diferencia con el líder** tras cada partida | Los datos de la ficha ya son los correctos. Se añade la **diferencia con el 1.º** (dato derivado, real) en el podio. El MVP lleva la cifra de kills como protagonista |
| **Plantilla de 16 equipos (esports)** — Boxout | Arte/personaje grande a un lado y tabla ordenada al otro | **Zona de arte** (§5.2): el fondo propio del usuario como foto protagonista, no como textura a 65 % |
| **Plantilla de clasificación (atletismo)** — Boxout | Foto de atleta a la izquierda, tabla a la derecha, limpia | Misma idea: foto con intención + tabla sobria |
| **Crítica de los gráficos de F1** — UX Collective | Pérdida de contraste, texto fino y pequeño, tamaños desiguales rompen el equilibrio, atenuar el color no basta para jerarquía (hace falta tamaño y alineación), cursivas reducen legibilidad en datos, números "decorados" ilegibles | Reglas §2.6: jerarquía por tamaño y alineación, **sin cursivas ni cifras decoradas**, formas de número uniformes, contraste mínimo |
| **Torre de tiempos de F1** — RaceFans, recreación de Trovster | Filas a bloques planos con posición, equipo, color de identidad y diferencia de tiempo; lectura instantánea | Variante de lista `tower` (§5.4): bloques planos, separación por huecos, no por bordes |
| **Sistema de gráficos de la Premier League** — DixonBaxi, Design Week | Un solo sistema gráfico para tablas, estadísticas y perfiles: todo "de la misma familia"; calidad editorial en tipografía y maquetación | Refuerza la regla de familia de v2 y la prioridad de **tipografía sobre ornamento** |
| **Marcador de la Premier League 2023-24** — Footy Headlines | Colores de equipo como fondo de la posición actual | **No se aplica ahora** (no tenemos colores/escudos por equipo). Ver "Fuera de alcance" |
| **Qué hace bueno a un overlay de LoL** — LHM | Distinguir tipos de números; el overlay debe "bajar la voz" cuando el juego sube | Principio §2.1 y §2.5: el total manda; kills/booyah/rank son secundarios y distintos |
| **Tendencias de diseño de fútbol 24/25** — portafolio de diseño para Luton Town | Fotografía contundente, títulos con tipografía fuerte, composiciones limpias | Título dominante y fotografía como protagonista |
| **Tipografía deportiva** — Font Alternatives | Cifras de marcador inequívocas, cifras tabulares, tipografía neutra para datos junto a una expresiva para títulos | §3 (tamaños) y §7 (fuentes): números tabulares y pares con carácter |

**Fuera de alcance (a propósito):** colores/escudos por equipo (requeriría datos nuevos del usuario). Si se quiere después, se hará como opción explícita; **nunca inventar colores por nombre**.

---

## 2. Principios nuevos (aplican a las 13 plantillas)

1. **Responde en 3 segundos.** Quien mira la imagen debe saber, sin esfuerzo: **quién ganó, por cuánto y quién fue el MVP.** Todo lo demás es secundario.
2. **Presupuesto de legibilidad** (§3): ningún texto por debajo del mínimo, ni "para que quepa".
3. **Menos cajas.** El borde/tarjeta es la excepción. Se separa con **filetes** de 1–2 px, **bloques planos de color** y espacio. Nunca una caja dentro de otra.
4. **El color significa algo.** Solo se colorea para codificar un dato: medalla (1.º/2.º/3.º), booyah > 0, resaltado del líder. Prohibido el color "por posición" sin dato.
5. **Un protagonista numérico.** El total del campeón es la cifra más grande de la imagen. Los demás números son tabulares y de tamaño fijo por rol (puntos > kills > booyah > rank).
6. **Jerarquía por tamaño y alineación**, no solo atenuando el color. **Sin cursivas** ni cifras decoradas en datos. Las posiciones tienen todas la **misma forma** (mismo ancho y alineación).
7. **Retícula.** Todo se alinea a una cuadrícula de 8 px; columnas numéricas alineadas a la derecha con cifras tabulares; márgenes constantes.
8. **Foto con intención.** El fondo propio se muestra en una **zona de arte** a plena fuerza (§5.2) en lugar de oscurecerse debajo de todo.

---

## 3. Presupuesto de legibilidad (lienzo lógico 1080 px de ancho)

La imagen se verá sobre todo en teléfono (~⅓ del tamaño lógico, aproximadamente). Estos son **mínimos duros**:

| Rol | Mínimo (px lógicos) | Notas |
|---|---|---|
| Etiquetas (`KILLS`, `MODERADOR`, kicker) | **22** | Solo mayúsculas con tracking moderado; nunca párrafos |
| Datos secundarios (kills, booyah, rank) | **26** | Mono/tabulares, alineados a la derecha |
| Nombre de equipo en la lista | **30** (28 en `compact`) | Peso 500–600 |
| Total en la lista | **34** | Peso 700, tabular |
| Podio: nombre | **40** | `fitText` hasta 30 como mínimo |
| Podio: total del 1.º | **120–150** | Es el protagonista |
| Podio: total del 2.º y 3.º | **64–72** | |
| MVP: kills | **40–56** | Número protagonista del bloque |
| Título | **80** (mín. 56 con `fitText`) | Una línea; si no cabe, dos a 64 |
| Pie | **22** | |

**Regla de oro:** si algo no cabe, se reduce **primero el podio** (mín. alto 220) y **luego las filas** (mín. 44 en `compact`); **nunca** se baja de los mínimos de texto. Si aun así no cabe, la densidad pasa a `multi`.

**Densidad (cambia respecto a v2):** `comfortable` ≤ 10 · `compact` 11–14 (filas 40) · `multi` > 14 → **varias imágenes** ("Parte 1/2…") repartiendo las filas por igual (p. ej. 18 → 9 + 9, 24 → 12 + 12), repitiendo cabecera y pie.

**Prueba automática obligatoria:** `npm run check-legibility` recorre el nodo exportado de `ResultImage` (4:5, 9:16, 1:1; 3, 10, 14 y 24 equipos) y **falla** si encuentra `font-size` bajo el mínimo de su rol, texto con contraste < 4.5:1 (o < 3:1 si ≥ 40 px) o desbordamiento horizontal.

---

## 4. Cambios en el sistema

```ts
// types.ts (cambios respecto a v2)
export type HeaderV = 'left' | 'center' | 'split' | 'banner';           // igual
export type PodiumV = 'stepped' | 'row' | 'hero';                       // igual nombre, nueva definición
export type ListV   = 'ledger' | 'dots' | 'tower';                      // bars→ledger, chips→tower
export type MvpV    = 'trio' | 'strip';                                 // cards→trio
export type ArtV    = 'top' | 'none';                                   // NUEVO

export interface TemplateConfig {
  // ...todo lo de v2 y FF...
  list: ListV;
  mvp: MvpV;
  art: ArtV;                                                            // NUEVO
}
```

- **Migración:** `bars → ledger`, `chips → tower`, `cards → trio`. Aprovechar para borrar el código de barras de progreso y de tarjetas con borde.
- Las **píldoras de totales desaparecen**. Los totales se muestran como **línea de texto** (todas las cabeceras salvo `split`) o como **cifras grandes 2×2** (`split`).
- `Decor.tsx` **no cambia** (v2 + FF), salvo la regla de §5.7.
- Se mantiene "Agregar una plantilla = agregar un objeto en `templates.ts`".

---

## 5. Definición de secciones (V3)

### 5.1 Cabecera
Elementos comunes (todas las variantes):
- **Kicker:** `JORNADA 1` — filete fino que ocupa el espacio — `12 OCT 2026`. Mono 24 px / 500, tracking .14 em. (El filete, no un punto medio, une los dos extremos.)
- **Título:** fuente de títulos, **80 px**, una línea (`fitText`, mín. 56 px; si no cabe, dos líneas a 64 px).
- **Totales (línea):** `10 equipos · 1 sala · 86 kills · 143 puntos · 1 booyah` — 26 px, **cifras en `text` / 600**, palabras en `muted`. Sin píldoras.

Variantes:
- **`left`**: logo (96 px) a la izquierda; a su derecha kicker y título; la línea de totales debajo, a todo el ancho.
- **`center`**: logo (80 px) centrado arriba; kicker, título y totales centrados.
- **`split`**: izquierda logo + kicker + título; derecha **cifras grandes 2×2** (64 px) con etiqueta 22 px. No hay línea de totales.
- **`banner`**: franja de ancho completo en `accent` con el título (`readableOn(accent)`); logo a la izquierda sobre la franja; kicker encima y totales en línea debajo.

### 5.2 Zona de arte (`art: 'top'`)
Bloque **a sangre** (de borde a borde, ignora el padding superior y los laterales) de **260 px** de alto en la parte alta del lienzo. La cabecera (§5.1) se coloca en una **placa sólida** (`bg`, sin transparencia) que cubre la parte inferior del bloque, tipo "lower third" de transmisión.

- **Con fondo propio del usuario:** la imagen en `object-fit: cover`, **a plena fuerza (sin scrim, sin opacidad)**. El borde inferior del bloque se corta con **diagonal** (≈ 28 px) dibujada con un **polígono SVG en `bg` encima de la foto** (no `clip-path` ni máscaras). En el resto del lienzo el fondo es **color plano `bg`** (el fondo propio ya no se oscurece por debajo de todo).
- **Sin fondo propio:** un **numeral gigante de la jornada** (`J1`, `1`, `FINAL`: lo que haya en el campo) en la fuente de títulos, 520–600 px, color `surface`, **recortado por el borde** del bloque y alineado abajo-izquierda. Es solo texto: sin filtros ni degradados.
- Con `art: 'top'` no se dibuja decoración sobre el bloque (la decoración va debajo y fuera de él).
- Con `art: 'none'`: se aplica v2 §7 (fondo propio a lienzo completo con scrim; sin fondo propio → color plano `bg` + decoración).

### 5.3 Podio (sin tarjetas con borde)
Posición (con `numerals`), nombre, `KILLS · BOOYAHS`, total. 1.º en `accent2`, 2.º plata, 3.º bronce. **El 2.º y el 3.º muestran además la diferencia con el 1.º** (`a 3 pts del 1.º`, 22 px, `muted`); si el 1.º y el 2.º empatan en total, se oculta.

- **`stepped`**: orden visual 2 · 1 · 3; alturas ≈ 215 / 260 / 180. Nombre y `K · B` **arriba** del escalón; el escalón es un **bloque plano**: el del 1.º relleno `accent2` con texto `readableOn(accent2)`; los del 2.º y 3.º relleno `surface` con una **franja superior de 6 px** en plata/bronce. Dentro del escalón: posición (72 px) y total (88 px; 1.º: 120).
- **`row`**: orden 1 · 2 · 3, misma altura (≈ 240), separados por **filetes verticales de 2 px** (`border`), sin caja. El 1.º ocupa `flex: 1.4` y lleva una franja superior de 6 px en `accent2`. Contenido apilado: posición 56 (color de medalla) · nombre 40 · `K · B` 26 · total 96 (1.º) / 72.
- **`hero`**: a la izquierda una **placa** (≈ 52 % del ancho, ≈ 250 px) con franja superior de 6 px en `accent2`; posición 64 · nombre 48 · `K · B` 26 · **total 150 px en `accent2`**. A la derecha, 2.º y 3.º apilados (≈ 120 px cada uno) separados por un filete horizontal; cada uno: posición 40 · nombre 34 · total 56 a la derecha.

### 5.4 Lista (posiciones 4 en adelante)
Columnas y tamaños según §3. Cabecera de columnas en 22 px mono. **Sin filas alternadas y sin barras de progreso.** Los ceros van en `muted`; **un booyah > 0 se destaca** (`accent2`, peso 700): el color codifica un dato.

- **`ledger`** *(libro de registro)*: filas de 52 px separadas por un **filete de 1 px**. Columnas: `#` (64) · `EQUIPO` (flexible, `fitText`) · `KILLS` (84) · `BOOY` (84) · `RANK` (84) · `TOTAL` (120, 34 px / 700). Todas las columnas numéricas alineadas a la derecha.
- **`tower`** *(torre de tiempos)*: filas de 48 px como **bloques planos** separados por **huecos de 4 px** (no por bordes). Bloque de posición (64 px, `surface`) · nombre · `K` `B` `R` · bloque de total (120 px, `surface`). Una **franja de 6 px a la izquierda** en `accent2` **solo si el equipo tiene booyah** (dato); en caso contrario no hay franja.
- **`dots`** *(puntos guía)*: `# NOMBRE ......... TOTAL`, con una línea punteada (borde punteado 2 px, `muted`) entre el bloque nombre + `K · B · R` (26 px, `muted`) y el total (34 px / 700). Sin filas alternadas.

`radius` se aplica solo a los **bloques planos** (podio, `tower`, logo): en el resto no hay cajas.

### 5.5 MVP (top 3 por kills)
- **`trio`** *(sin cajas)*: etiqueta `MVP · KILLS` (22 px) con un filete que ocupa el espacio; debajo, **tres columnas separadas por filetes verticales**. Cada una: **kills a 56 px** (medalla: `accent2` / plata / bronce) a la izquierda; a la derecha jugador (30 px) y equipo (22 px, `muted`) apilados. Alto ≈ 112 px.
- **`strip`**: una sola franja de 88 px: etiqueta `MVP · KILLS` a la izquierda y los 3 jugadores en línea, cada uno con kills a 40 px, jugador 28 px y equipo 22 px debajo. Separados por filetes verticales.
- `after-list` / `before-list` igual que v2.

### 5.6 Pie
Filete de 1 px y, debajo, una línea en mono 22 px: `MODERADOR · NOMBRE` a la izquierda y `SALA N · BOOYAH …` a la derecha. Si no hay moderador, se omite el bloque (nunca `[placeholder]` en la exportación).

### 5.7 Decoración
Reglas de v2/FF más una nueva: **la decoración nunca pasa por debajo de texto de datos** (nombres, números, etiquetas). Si lo hace, se mueve a una esquina libre o se baja su opacidad hasta que el contraste del texto siga ≥ 4.5:1. Puede **sangrar** por el borde del lienzo (queda recortada).

### 5.8 Fondo por defecto
**Se retira `default-background.png` como fondo por defecto.** Sin fondo propio: color plano `bg` + decoración (+ numeral gigante si `art: 'top'`). El archivo se conserva en `assets/` por si el usuario lo elige como fondo explícito en el editor.

---

## 6. Geometría 4:5 (puntos de partida, a validar con renders reales)

Lienzo 1080 × 1350, padding 52 vertical / 56 horizontal, separación entre bloques 20 px. `comfortable` (≤ 10 equipos):

| Bloque | `art: 'none'` | `art: 'top'` |
|---|---|---|
| Cabecera (kicker + título + totales) | ≈ 180 | **260** (bloque de arte a sangre; la placa va dentro) |
| Podio | ≈ 260 (máx. 270) | ≈ 240 |
| MVP | 88 (`strip`) / 112 (`trio`) | 88 / 112 |
| Lista: encabezado 28 + 10 filas | 28 + 10 × 52 | 28 + 10 × 50 |
| Pie | ≈ 30 | ≈ 30 |

Si la suma no cabe, aplicar la **regla de oro** de §3. **9:16** y **1:1**: v2 §3 sigue valiendo, pero con los mínimos de texto de §3; en **1:1** el MVP es `strip` y la cabecera usa solo la línea de totales (sin `split` ni arte).

---

## 7. Catálogo revisado (las 13 plantillas)

Se mantienen los `id`, los **tokens de color** (v2 §5.2 y FF §3.2) y los temas oscuro/claro. Se actualizan las variantes. **Se recompone todo, incluida Corona.**

| # | id | tema | cabecera | podio | lista | MVP | pos. MVP | decoración | radio | num. | arte | fuentes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | corona | oscuro | left | stepped | ledger | trio | after | rings | 14 | pad | none | P1′ |
| 2 | brasa | oscuro | banner | stepped | ledger | trio | before | slashes | 4 | pad | none | P2 |
| 3 | medianoche | oscuro | center | row | ledger | strip | after | arcs | 8 | plain | top | P3′ |
| 4 | marfil | claro | left | hero | dots | strip | after | brackets | 4 | ordinal | none | P4 |
| 5 | pista | oscuro | split | row | tower | trio | before | stripes | 0 | pad | none | P5 |
| 6 | granate | oscuro | center | stepped | dots | trio | after | rings | 8 | plain | top | P6 |
| 7 | cobalto | oscuro | banner | row | tower | strip | before | slashes | 0 | pad | none | P7 |
| 8 | selva | oscuro | left | hero | tower | trio | after | dots | 8 | plain | top | P8 |
| 9 | hielo | claro | split | stepped | ledger | strip | before | grid | 8 | hash | none | P9 |
| 10 | ambar | oscuro | banner | row | dots | strip | after | scan | 0 | pad | none | P10 |
| 11 | booyah | oscuro | banner | hero | tower | strip | before | chevrons | 0 | pad | top | P11 |
| 12 | zona-roja | oscuro | split | row | ledger | trio | after | zone | 4 | plain | none | P12 |
| 13 | kalahari | claro | center | stepped | dots | trio | after | slashes | 8 | ordinal | top | P13 |

Cada plantilla sigue cambiando **≥ 3 opciones** respecto a Corona (lista, MVP, arte y decoración suman diferencias reales de composición, no solo de borde).

**Cambios de tipografía (por ser las más gastadas):**

| Par | Antes | Ahora | Paquetes (@fontsource) |
|---|---|---|---|
| P1′ (Corona) | Syne / Space Grotesk | **Sofia Sans Extra Condensed 700/800** / **Libre Franklin 400/500/700** | `sofia-sans-extra-condensed`, `libre-franklin` |
| P3′ (Medianoche) | Unbounded / Hanken Grotesk | **League Gothic 400** / Hanken Grotesk 400/500/700 | `league-gothic`, `hanken-grotesk` |

Los demás pares no cambian. Verificar que cada paquete exista; si falta alguno, sustituir por uno equivalente (evitar Inter, Poppins, Montserrat, Roboto) y anotarlo en `DECISIONS.md`. **Cifras tabulares siempre** (`font-variant-numeric: tabular-nums`) y, para totales y posiciones, **sin cursivas**.

---

## 8. Skills (leer el `SKILL.md` antes de escribir código)

| Orden | Skill | Uso aquí |
|---|---|---|
| 1 | `redesign-existing-projects` | Auditar las 13 plantillas actuales (capturas en `docs/tpl-before/`) y rediseñar sin romper datos ni exportación |
| 2 | `design-taste-frontend` | Criterio de jerarquía, ritmo y qué eliminar |
| 3 | `high-end-visual-design` | Microtipografía y acabado fino de números, filetes y bloques |
| 4 | `minimalist-ui` | Base para "menos cajas, más filetes" en `ledger` y `dots` |
| 5 | `industrial-brutalist-ui` | Carácter para `booyah`, `pista`, `cobalto` y `ambar` (bloques duros, tipografía condensada) |
| 6 | `brandkit` | Dejar los tokens de tamaño/rol (§3) en un solo lugar (`tokens.ts`) |
| 7 | `break-ui` | **QA:** romper las plantillas (24 equipos, nombres largos/unicode, sin logo, fondos extremos) |
| 8 | `full-output-enforcement` | No dejar nada a medias |

`emil-design-eng` y las otras skills de animación **no aplican** a la imagen exportada (es estática). Solo se mantiene el movimiento de la galería de `TEMPLATES-FREEFIRE.md` §6; las miniaturas se verán ahora más legibles porque los textos son más grandes. Si alguna skill falta en el entorno, anotarlo en `DECISIONS.md`.

---

## 9. Plan de trabajo (no saltes pasos)

1. **Auditoría:** `npm run contact-sheet` con el estado actual → `docs/tpl-before/`. Guardar `docs/refs.md` con los enlaces de §1 tras revisarlos visualmente.
2. **Tokens de tamaño** (§3) en `tokens.ts` + script `check-legibility`. Ver cómo falla hoy.
3. **Secciones** por orden: Cabecera (y zona de arte) → Podio → Lista (`ledger`, `tower`, `dots`) → MVP (`trio`, `strip`) → Pie. Empezar por **Corona**.
4. **Migración de config** (`bars→ledger`, `chips→tower`, `cards→trio`) y cargar la tabla de §7.
5. **Fuentes** nuevas (P1′, P3′).
6. **QA** con `break-ui` + prueba de teléfono + prueba de 3 segundos + hoja de contactos de las 13.
7. **Documentación:** `README.md` (capturas antes/después de las 13) y `DECISIONS.md`.

---

## 10. Control de calidad y definición de terminado

**Prueba de teléfono (obligatoria):** renderizar cada plantilla en 4:5 con 10 equipos y verla en un teléfono real (o a **390 px de ancho** en el navegador). Se debe poder leer **todo**, incluida la columna de kills, sin hacer zoom.

**Prueba de los 3 segundos (obligatoria):** mostrar la imagen 3 segundos a 3 personas ajenas y preguntar: *¿quién ganó, por cuánto y quién es el MVP?* Si fallan, el protagonista no está claro: volver a §2.

**Prueba de la mano humana:** tapar el logo y mostrar la hoja de contactos; nadie debe decir "parece hecho por IA". Si lo dicen, revisar §0 punto por punto.

**Checklist por plantilla:**
- [ ] En `templates.ts` con la configuración exacta de §7 y los tokens de v2 §5.2 / FF §3.2.
- [ ] Mantiene todos los bloques del esqueleto y los datos (v2 §1); sin píldoras, sin barras de progreso, sin cajas dentro de cajas.
- [ ] `npm run check-legibility` sin fallos en 4:5, 9:16 y 1:1.
- [ ] Probada con 3, 10, 14 y 24 equipos (con `multi` en 24), nombres largos/unicode (`ㅤ`, superíndices, kanji), sin logo, sin fondo propio y con fondos muy claros y muy oscuros.
- [ ] `art: 'top'`: con foto propia (sin scrim) y sin ella (numeral gigante); la placa siempre legible.
- [ ] El color solo aparece donde codifica un dato (medalla, booyah, líder).
- [ ] Diferencia con el 1.º correcta en 2.º y 3.º (y oculta si hay empate).
- [ ] Exporta PNG 2× correcto (Chromium, Firefox, Safari); sin `backdrop-filter`, `mix-blend-mode`, `filter`, `clip-path` ni máscaras en el nodo exportado.
- [ ] Contraste ≥ 4.5:1 en texto y ≥ 3:1 en elementos grandes, incluso con `accent`/`text` del usuario.
- [ ] Misma entrada → mismo PNG.

**Definición de terminado:**
- [ ] Las 13 plantillas rediseñadas, reconocibles como una familia (misma estructura) y **ninguna** como un cambio de color de otra.
- [ ] Pasan las pruebas de teléfono, 3 segundos y mano humana.
- [ ] Código de barras de progreso, tarjetas con borde y píldoras eliminado; `default-background` ya no es el fondo por defecto.
- [ ] `README.md` con capturas antes/después; `DECISIONS.md` con sustituciones de fuentes, skills ausentes y decisiones de maquetación.

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
