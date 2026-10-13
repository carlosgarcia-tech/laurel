# UI-REDESIGN.md — Rediseño de la interfaz del editor (Laurel)

> **Alcance:** SOLO el "chrome" de la app (barra superior, columna de pasos, escenario de vista previa, selector de plantilla, botones, formularios, vacíos y avisos).
> **NO se toca:** `ResultImage`, `templates.ts`, las secciones de la imagen ni el pipeline de exportación. Esas reglas siguen en `TEMPLATESv2.md` y `TEMPLATES-FREEFIRE.md`.
> La UI de la app **no reutiliza** los tokens de las plantillas: es un sistema aparte, neutro, para que la imagen exportada sea lo único con color fuerte en pantalla.

---

## 0. Diagnóstico (qué se ve "hecho por IA" hoy y por qué)

Lo que se observa en la captura actual, y lo que hay que eliminar:

| Síntoma                                                                                 | Por qué delata a una IA                                                |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Insignias de paso en **círculos verdes** (1, 2, 3, 4)                                   | Patrón de plantilla de wizard; ocupa espacio y no dice nada            |
| **Todo es una tarjeta** igual: mismo borde, mismo radio, mismo fondo, mismo padding     | Cero jerarquía; nada manda sobre nada                                  |
| Verde esmeralda sobre fondo verde-negro en **todo** (bordes, botones, selección, fondo) | La paleta "SaaS oscuro" por defecto; el acento deja de significar algo |
| Títulos de sección en **MAYÚSCULAS con tracking** en cada bloque                        | Tic repetido; grita igual que todo lo demás                            |
| Texto de ayuda gris bajo casi cada campo y una **píldora** de privacidad arriba         | Relleno "tranquilizador"; la UI explica de más                         |
| Opciones de cálculo como **cuatro tarjetas grandes** con borde brillante al seleccionar | Ocupa media pantalla para una decisión de una línea                    |
| Desempate con **casillas** aunque el texto dice "en este orden"                         | El orden importa y la UI no lo deja ordenar                            |
| Selector de plantilla como **4.º bloque al fondo**, fuera de vista                      | Lo más visual de la app está escondido                                 |
| Radio uniforme (~12–14 px) en todo                                                      | Sin criterio de formas                                                 |

**Objetivo:** que parezca una **herramienta de producción hecha por alguien que organiza torneos**: densa donde conviene, calmada donde no, con una sola cosa dominante (la imagen) y decisiones visibles de diseño.

---

## 1. Skills que el agente debe usar

Lee el `SKILL.md` de cada una antes de escribir código (están en `skills/`). Orden:

| Orden | Skill                                                                | Uso aquí                                                                          |
| ----- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 1     | `redesign-existing-projects`                                         | **Primera:** auditar la UI actual y rediseñar sin romper funcionalidad ni lógica. |
| 2     | `design-taste-frontend`                                              | Criterio general: jerarquía, ritmo, espaciado, qué quitar.                        |
| 3     | `minimalist-ui`                                                      | Base estética (hairlines en vez de tarjetas, tipografía como estructura).         |
| 4     | `high-end-visual-design`                                             | Acabado: detalles finos, microtipografía, estados.                                |
| 5     | `apple-design`                                                       | Densidad y claridad de controles, estados, accesibilidad táctil.                  |
| 6     | `brandkit`                                                           | Dejar los tokens del sistema documentados (§3) en un solo lugar.                  |
| 7     | `emil-design-eng` + `animation-vocabulary` + `animation-performance` | Movimiento (§8). Mismas reglas que `TEMPLATES-FREEFIRE.md` §6.                    |
| 8     | `break-ui` + `review-animations`                                     | **QA final:** intentar romper la interfaz.                                        |
| 9     | `full-output-enforcement`                                            | No dejar nada a medias.                                                           |

No usar `gpt-taste`, `stitch-design-taste` ni las variantes experimentales de `design-taste-frontend` como guía principal: empujan a un look más "de generador". Si alguna skill falta, anotarlo en `DECISIONS.md`.

---

## 2. Dirección de diseño (una sola idea, decidida)

**"Mesa de producción."** La app es el escritorio donde se prepara una imagen de resultados: papel y tinta, no neón.

- **Una cosa domina:** el escenario con la imagen. Todo lo demás es secundario y silencioso.
- **Sin tarjetas.** Los pasos son secciones separadas por **filetes de 1 px**, no cajas.
- **Neutro cálido.** Grafito con un punto de calidez (no verde-negro). El acento aparece **poco** y siempre significa "esto está activo/seleccionado".
- **Tipografía como estructura:** números en monoespaciada para dar sensación de libro de registros; títulos en sentence case, no en mayúsculas.
- **Tono humano en el texto:** frases cortas, voz de organizador, cero relleno.

---

## 3. Tokens del sistema de la app

### 3.1 Color (modo oscuro por defecto; el claro es opcional y fuera de alcance)

| Token              | Valor     | Uso                                                           |
| ------------------ | --------- | ------------------------------------------------------------- |
| `--bg`             | `#141311` | fondo de la app                                               |
| `--stage`          | `#0e0d0c` | fondo del escenario de la imagen                              |
| `--line`           | `#2b2925` | filetes                                                       |
| `--line-strong`    | `#3d3a34` | borde de inputs y botones secundarios                         |
| `--text`           | `#ece8de` | texto principal                                               |
| `--text-2`         | `#a39d8f` | texto secundario                                              |
| `--text-3`         | `#7a7569` | etiquetas pequeñas (solo ≥ 12 px)                             |
| `--accent`         | `#b9d77a` | selección activa, foco, vínculos. **Nunca** como fondo grande |
| `--danger`         | `#e0644f` | errores y "borrar"                                            |
| `--btn-primary-bg` | `#ece8de` | botón principal: **hueso**, no verde                          |
| `--btn-primary-fg` | `#141311` |                                                               |

Contrastes verificados al implementar: `--text` y `--text-2` ≥ 4.5:1 sobre `--bg`; `--text-3` solo en tamaños donde cumpla 4.5:1, si no, usar `--text-2`.

### 3.2 Tipografía (autoalojada, @fontsource, solo `latin` + `latin-ext`)

| Rol                                    | Fuente            | Pesos           | Paquete             |
| -------------------------------------- | ----------------- | --------------- | ------------------- |
| Interfaz                               | Schibsted Grotesk | 400 / 500 / 700 | `schibsted-grotesk` |
| Números, etiquetas, nombres de archivo | IBM Plex Mono     | 400 / 500       | `ibm-plex-mono`     |

Verifica que existan; si falta alguno, sustitúyelo por uno equivalente (evitar Inter, Poppins, Montserrat, Roboto como protagonistas) y anótalo en `DECISIONS.md`.

Escala (px / interlineado): títulos de sección **17/22 · 600**, texto **14/20**, etiquetas de campo **12/16 · 500**, números **13/16 mono**, wordmark **22/24 · 700**. `font-variant-numeric: tabular-nums` en todo número.

### 3.3 Forma y espacio

- **Radio:** controles (inputs, botones, segmentos) **6 px**; escenario de la imagen **2 px**; no hay otro radio. Prohibido el "todo redondeado".
- **Sin sombras** en la app. Única excepción: 1 px de filete alrededor de la imagen.
- **Sin degradados, brillos, vidrio ni blur.**
- **Espacio:** base 4 px. Entre secciones 32 px; entre campos 16 px; padding horizontal de la columna 28 px.
- Iconos: solo los **funcionales** (cerrar, arrastrar, calendario nativo). Ningún icono decorativo; las acciones llevan texto.

---

## 4. Estructura de pantalla (≥ 1100 px)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Laurel                         Jornada 1 · Copa estelar     Borrar datos │  barra (56 px)
├──────────────────────┬───────────────────────────────────────────────────┤
│ 01  Resultados       │                                                   │
│     10 equipos · 1   │                [ 4:5   9:16   1:1 ]               │
│     sala  [Editar]   │                                                   │
│ ─────────────────    │           ┌─────────────────────┐                 │
│ 02  Torneo           │           │                     │                 │
│     (campos)         │           │   IMAGEN (stage)    │                 │
│ ─────────────────    │           │                     │                 │
│ 03  Cálculo          │           └─────────────────────┘                 │
│     ○ Score estándar │                                                   │
│     ○ Posición+kills │   Descargar PNG   Copiar imagen    2160 × 2700    │
│ ─────────────────    │ ─────────────────────────────────────────────────│
│ 04  Desempate        │  Plantillas:  Todas · General · Free Fire         │
│     1 Más kills      │  [mini][mini][mini][mini][mini] →                 │
└──────────────────────┴───────────────────────────────────────────────────┘
 Todo se procesa en tu navegador; los archivos no se suben.                    pie
```

- **Columna izquierda:** 400 px fija, scroll propio, sin tarjetas. Cada sección: **número mono** (`01`) en una columna angosta de 32 px a la izquierda + título; el contenido alineado con el título. **Nada de círculos.**
- **Escenario (derecha):** ocupa el resto, fondo `--stage`, la imagen centrada y **lo más grande posible** sin hacer scroll (escala con el alto disponible).
- **Selector de plantilla:** **sube** a una tira horizontal bajo el escenario (siempre a la vista). Deja de ser el 4.º paso: es una herramienta del escenario. Pestañas como texto con subrayado (`Todas · General · Free Fire`), no un control segmentado ancho.
- **Acciones de exportación** justo bajo la imagen, alineadas a la izquierda: `Descargar PNG` (principal, hueso) y `Copiar imagen` (secundario, borde). A la derecha, en mono pequeño, la resolución: `2160 × 2700`.
- **Barra superior:** wordmark a la izquierda; en el centro un **título vivo** (`Jornada 1 · Copa estelar`, se actualiza al escribir); a la derecha `Borrar datos` como botón de texto en `--danger` (con confirmación inline, no modal).
- **Privacidad:** se **elimina la píldora**. La frase va en el pie de la app, en `--text-3`: _"Todo se procesa en tu navegador. Los archivos no se suben."_

### 4.1 Móvil (< 1100 px)

- La imagen arriba, fija (sticky) y reducida; los pasos debajo en una sola columna; la tira de plantillas pasa a una **hoja inferior** (bottom sheet) abierta desde un botón `Plantilla: Booyah`.
- Objetivos táctiles ≥ 44 px.

---

## 5. Componentes (definición)

### 5.1 Secciones colapsables (progressive disclosure)

- Un paso completado se **resume en una línea** (`10 equipos · 1 sala`) con botón de texto `Editar`. Un paso pendiente o activo se muestra abierto.
- El cambio abierto/cerrado es **instantáneo** con fundido de contenido de 120 ms (opacidad). **No animar altura** (ver §8).
- Solo el paso activo tiene el número en `--accent`; los demás en `--text-3`.

### 5.2 Zona de archivos (paso 01)

- **Vacía:** un área discreta con **filete punteado de 1 px**, altura 96 px (no 200), una línea de texto: _"Suelta aquí tus logs (.txt o .log), uno por sala"_ y un botón de texto `elegir archivos`. Sin icono grande ni botón verde.
- **Con archivos:** la zona se reduce a una lista de filas en mono: `sala_1.log · 10 equipos · 86 kills` + `quitar`. Debajo, `Añadir más` en texto. Se muestran errores **por archivo** en `--danger` con la causa concreta.
- **Arrastre sobre la zona:** cambia el filete a `--accent` (sin escala).

### 5.3 Campos (paso 02)

- Etiqueta arriba (12 px / 500, `--text-2`), input debajo: alto **40 px**, fondo transparente, borde `--line-strong` 1 px, radio 6, texto 14 px.
- Foco: borde `--accent` + anillo de 2 px `--accent` al 35 % de opacidad (sin brillo difuso).
- **Título y Jornada** en la misma fila (70 / 30); **Fecha** y **Moderador** en la misma fila.
- Se elimina el texto de ayuda de fecha salvo que haya error; el formato "13 OCT 2026" se ve en la imagen.
- El campo de moderador **no** muestra el placeholder `[Moderador]` en la imagen exportada (regla v2 §9).

### 5.4 Modo de cálculo (paso 03)

- **Lista de opciones sin cajas:** cada fila = punto de radio + título en 14 px / 500 + descripción en una línea `--text-2` 13 px. Alto de fila ≈ 52 px.
- Seleccionada: barra vertical de **2 px `--accent`** a la izquierda de la fila y título en `--text`. Sin borde brillante, sin relleno.
- `Personalizado` abre sus campos **debajo de la fila**, sangrados, con fundido de 120 ms.

### 5.5 Desempate (paso 04)

- **Lista ordenable** (arrastrar): cada fila `1  Más kills  ⋮⋮  [interruptor]`; el número en mono indica la prioridad real. Se puede activar/desactivar cada criterio.
- **Alternativa sin ratón obligatoria:** botones `subir` / `bajar` visibles al enfocar la fila y atajos con teclado (`Alt+↑` / `Alt+↓`). El orden se anuncia con `aria-live`.
- Leyenda de una línea: _"Si hay empate en el total, se decide en este orden."_

### 5.6 Selector de plantilla (tira bajo el escenario)

- Miniaturas **reales** (render de `ResultImage`, v2 §7) de 150 px de ancho, 4:5, sin marco ni sombra; la **seleccionada** lleva filete `--accent` de 2 px **fuera** de la miniatura (con el mismo radio exterior de 2 px).
- Bajo cada miniatura: nombre en 13 px / 500 y, en mono 11 px, `claro` / `oscuro`. Sin descripciones largas.
- Scroll horizontal con _snap_, sin barra visible; las flechas del teclado mueven la selección.
- La tira recuerda la pestaña activa; `Free Fire` muestra la insignia `FF` como texto, no como ícono.

### 5.7 Selector de formato (4:5 · 9:16 · 1:1)

- Tres opciones de **texto** alineadas sobre el escenario, la activa subrayada con 2 px `--accent`. No usar un control segmentado con relleno.

### 5.8 Botones

| Tipo       | Estilo                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| Principal  | fondo `--btn-primary-bg`, texto `--btn-primary-fg`, alto 40, radio 6, 14 px / 600                      |
| Secundario | transparente, borde `--line-strong`, texto `--text`                                                    |
| Texto      | sin borde; subrayado fino al hover (solo puntero fino)                                                 |
| Peligro    | texto `--danger`; confirma con una segunda pulsación en el mismo sitio (`¿Seguro? Borrar`) durante 4 s |

Todos con `:active { transform: scale(0.97) }` y `:focus-visible` visible.

### 5.9 Estados vacíos y de error

- **Sin archivos cargados:** el escenario muestra la imagen con **datos de ejemplo** y una etiqueta mono pequeña sobre la esquina del escenario: `EJEMPLO`. Al cargar datos reales, la etiqueta desaparece. (La imagen exportada con ejemplo no debe permitirse: botones de exportar desactivados con la razón al lado: _"Carga al menos un log para exportar."_).
- **Errores:** en línea, pegados al campo o archivo, en `--danger`, con la causa concreta. Nada de avisos genéricos tipo "Algo salió mal".
- **Cargando:** texto en mono (`Procesando 3 archivos…`), sin esqueletos brillantes ni spinners decorativos.

---

## 6. Copy (voz humana, español neutro, sin relleno)

| Hoy                                                                                                  | Nuevo                                                              |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| ARCHIVOS DE RESULTADOS                                                                               | Resultados                                                         |
| Arrastra aquí tus archivos / Logs de resultados .txt o .log — uno por sala. Se pueden cargar varios. | Suelta aquí tus logs (.txt o .log), uno por sala                   |
| Elegir archivos (botón verde)                                                                        | elegir archivos (texto)                                            |
| Aún no hay archivos cargados.                                                                        | _(se omite: el estado vacío ya lo dice)_                           |
| DATOS DEL TORNEO                                                                                     | Torneo                                                             |
| Nombre del moderador                                                                                 | Moderador                                                          |
| En la imagen se muestra como «13 OCT 2026»                                                           | _(se omite)_                                                       |
| MODO DE CÁLCULO                                                                                      | Cálculo                                                            |
| Score total estándar · Usa el TotalScore de cada log tal cual.                                       | Score del log · Usa el TotalScore tal cual                         |
| Posición + kills · Recalcula con la tabla de posiciones y los kills.                                 | Posición + kills · Recalcula con tu tabla de puntos                |
| Solo kills · Puntúa únicamente los kills de cada equipo.                                             | Solo kills · Cada kill suma, nada más                              |
| Personalizado · Define tu propia tabla de puntos y multiplicador de kills.                           | Personalizado · Tu tabla de puntos y multiplicador de kills        |
| Desempate orden final / Aplicado tras ordenar…                                                       | Desempate · Si hay empate en el total, se decide en este orden     |
| Todo se procesa en tu navegador · sin subir archivos                                                 | _(pie)_ Todo se procesa en tu navegador. Los archivos no se suben. |
| Borrar mis datos                                                                                     | Borrar datos                                                       |
| PLANTILLA                                                                                            | _(la tira tiene su propia etiqueta: «Plantilla»)_                  |
| Se exporta a 2160 × 2700 px (2x)                                                                     | `2160 × 2700` (mono, junto a los botones)                          |

Reglas: sentence case, sin signos de exclamación, sin "¡Listo!" ni emojis, verbos directos, números con formato local.

---

## 7. Hacer / Evitar (resumen)

**Hacer**

- Jerarquía por **tamaño, peso y espacio**, no por cajas y colores.
- Alinear a una **retícula**: la columna de números (`01…04`), los títulos y los contenidos comparten la misma línea de inicio.
- Dejar **aire** alrededor de la imagen; es la protagonista.
- Mostrar el **estado real** (resumen de lo cargado, título vivo en la barra).
- Decisiones **consistentes**: 1 radio de control, 1 grosor de filete, 1 acento con significado.

**Evitar**

- Tarjetas anidadas, bordes brillantes, halos, degradados, vidrio, sombras grandes.
- Mayúsculas con tracking en cada título; íconos decorativos; emojis.
- Texto de ayuda bajo cada campo; píldoras informativas; avisos genéricos.
- Verde esmeralda como color de todo; fondos verdosos.
- Fuentes "por defecto de IA" (Inter, Poppins, Montserrat, Roboto) como protagonistas.

---

## 8. Movimiento (criterio `emil-design-eng`; mismas curvas de `TEMPLATES-FREEFIRE.md` §6)

```css
:root {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
}
```

- Primero la pregunta: **¿esto debe animarse?** Lo que se usa muchas veces por sesión (cambiar plantilla, abrir/cerrar pasos, editar campos) se anima **muy poco o nada**.
- **Máximo 300 ms**; nunca `ease-in`; nada nace de `scale(0)`; solo `transform` y `opacity`.
- **No animar altura, ancho, margen ni sombra.** Los pasos colapsables cambian al instante con fundido de contenido (120 ms).
- Botones y filas pulsables: `:active { transform: scale(0.97) }` 120 ms. Hover solo con `@media (hover:hover) and (pointer:fine)`.
- Transiciones CSS (interrumpibles), no keyframes, para todo estado.
- `prefers-reduced-motion`: quitar desplazamiento y escala; mantener opacidad ≤ 120 ms.

| Dónde                               | Movimiento                                            | Duración     |
| ----------------------------------- | ----------------------------------------------------- | ------------ |
| Cambio de plantilla en el escenario | crossfade entre dos capas (el contenedor reserva 4:5) | 140 ms       |
| Cambio con teclado en la tira       | **sin animación**                                     | —            |
| Borde de selección en miniatura     | opacidad                                              | 160 ms       |
| Indicador de formato / pestañas     | `translateX` del subrayado                            | 200 ms       |
| Popover (selector de fuente/color)  | `scale(0.96→1)` + opacidad desde su botón             | 180 ms       |
| Aviso "PNG listo"                   | entra 8 px + opacidad; sale solo con opacidad         | 200 / 120 ms |
| Confirmación de "Borrar datos"      | cambio de texto con opacidad                          | 120 ms       |

**La imagen exportada sigue estática**: `data-capture="true"` desactiva transiciones y animaciones (regla de `TEMPLATES-FREEFIRE.md` §6.3).

---

## 9. Accesibilidad

- Contraste ≥ 4.5:1 en texto y ≥ 3:1 en bordes de controles y componentes.
- Foco visible en todo con `:focus-visible`, nunca eliminado.
- Lista de desempate y tira de plantillas usables **solo con teclado**.
- Etiquetas reales en todos los inputs (`<label>`), no solo placeholders.
- Sin información transmitida solo por color (la selección lleva barra/subrayado además del acento).
- Respeta `prefers-reduced-motion` y `prefers-color-scheme` (el modo claro queda fuera de alcance pero no debe romperse).

---

## 10. Plan de trabajo (no saltes pasos)

1. **Auditoría** con `redesign-existing-projects`: capturas de la UI actual (guardar en `docs/ui-before/`) y lista de componentes a reemplazar.
2. **Tokens y fuentes** (§3) en un solo archivo (`brandkit`); eliminar los colores verdes anteriores del chrome.
3. **Layout** (§4): barra, columna sin tarjetas, escenario y tira de plantillas.
4. **Componentes** (§5), de arriba abajo: archivos → campos → cálculo → desempate → selector de plantilla → botones.
5. **Copy** (§6) aplicado en todos los textos de la UI.
6. **Movimiento** (§8), solo lo listado.
7. **QA** con `break-ui` y `review-animations`; capturas finales en `docs/ui-after/`.

---

## 11. Control de calidad y definición de terminado

**Prueba de la "mano humana" (obligatoria):** tapar el logo y mostrar la captura a 3 personas ajenas; ninguna debería decir "parece hecho por IA" ni "parece una plantilla de SaaS". Si lo dicen, volver a §7.

**Checklist**

- [ ] No hay tarjetas anidadas, círculos de paso, píldoras informativas ni títulos en mayúsculas con tracking.
- [ ] Un solo radio de control (6 px) y escenario a 2 px; sin sombras, degradados ni halos.
- [ ] El acento (`--accent`) solo marca selección/foco/vínculo; el botón principal es hueso.
- [ ] La imagen es protagonista: sin scroll en 1440×900 para ver la imagen completa y los botones.
- [ ] La tira de plantillas está **siempre visible** bajo el escenario; las miniaturas son renders reales.
- [ ] Desempate ordenable (arrastre + teclado).
- [ ] Estado vacío con `EJEMPLO` y exportación desactivada hasta tener datos.
- [ ] Todos los textos de §6 aplicados; sin signos de exclamación ni emojis.
- [ ] Ninguna animación > 300 ms, sin `ease-in`, sin animar layout; reduced-motion funcional.
- [ ] El PNG exportado es **idéntico** al de antes del rediseño (diff de píxeles contra `docs/ui-before/`).
- [ ] Probado en Chromium, Firefox y Safari; móvil con hoja inferior; teclado completo.
- [ ] `DECISIONS.md` registra: sustituciones de fuentes, skills ausentes y decisiones de diseño; `README.md` con capturas antes/después.
