# DECISIONS.md

Registro de decisiones tomadas donde `AGENTS.md` no especifica nada (o especifica algo que requiere un cambio mínimo, documentado aquí).

## Fase 1 — Núcleo

### Nombre del producto: "Laurel"

El dueño llamó al proyecto "laurel" (símbolo de laurel = trofeo). La app se comporta de forma genérica ("resultados de torneos"), cumpliendo la regla de §1 de no acoplarse a Free Fire.

### Fixture de tests sintético

El dueño no entregó aún el `MatchResult_..._log.txt` real. El fixture `tests/fixtures/MatchResult_example_log.txt` es una **reconstrucción** a partir de todos los datos verificados que el propio `AGENTS.md` §6 cita (nombres de los 10 equipos, sus kills/booyahs/puntos/totales exactos, los jugadores de INFERNAL FOX y TAURUS GAMER citados por nombre, el orden por `Rank` con los ranks 5/6 no monótonos y el resultado del MVP). Pendiente: reemplazarlo cuando se entregue el log real y verificar que la tabla §6 sigue reproduciéndose exactamente.

### Extensiones mínimas a las interfaces de §5

- `TeamStanding.bestRank: number` — necesario para el desempate `best-rank` (mejor posición lograda por el equipo en cualquier sala).
- `PlayerStanding.teamKey: string` — necesario para trazar cada MVP a su equipo sin búsquedas por nombre.
- `RoomSource` (nueva, features/upload): archivo cargado con su sala parseada y un `id` estable para la lista.
- `Settings.scrimOpacity: number` — opacidad del scrim sobre el fondo propio, ajustable (§8 dice "opacidad ajustable").
- `Settings.fontFamily` se acota a `DisplayFont` ('Syne' | 'Oxanium' | 'Space Grotesk') para el select de fuentes.
- `EngineResult` y `TournamentTotals` (nuevas): contenedores del resultado del motor y de las píldoras de cabecera.

### Desempate del MVP: "mejor puesto de su equipo"

Se interpretó como la **mejor posición (`Rank`) lograda por el equipo en la partida** (no su posición en la clasificación final acumulada), porque con el fixture reproduce el resultado citado en §6: IFX.astro10 (equipo rank 1) por encima de TG joãopene (equipo rank 2) empatados con 7 kills. En multi-sala se usa el `bestRank` acumulado del equipo. Desempates en orden: kills ↓ → mejor rank del equipo ↑ → orden de aparición.

### Advertencia de nombres similares: longitud mínima

`AGENTS.md` pide avisar con distancia de edición ≤ 2. Con equipos de pocos caracteres eso marca falsos positivos (`LY GOLD` vs `S7 GOLD`, ambos legítimos y distintos). Se agregó un requisito adicional: **longitud mínima de 8 caracteres** (normalizados) para emitir la advertencia. La duplicidad exacta (misma clave) sigue agrupándose y nunca se advierte. La UI se puede unir manualmente (fase 4); por ahora se advierte.

### Motor y modos en fase 1

- `position-kills` y `custom` comparten la misma fórmula (tabla de posiciones + `kills × killPoints`); la diferencia es de UI (`custom` expondrá tabla editable), como anticipa §7.
- `kills-only` ignora la tabla de posiciones y multiplica kills por `killPoints`.
- `standard` usa el `TotalScore` del log tal cual: por eso los ranks 5/6 invertidos del log (RankScore 5 y 6 no monótonos) quedan intactos, y es exactamente lo que valida el test de tabla §6.

## Fase 2 — Editor y preview (más el bloque de exportación de la §9)

### Tercera fuente autoalojada: Oxanium

§8 pide "al menos 3 opciones autoalojadas". Se añadió `@fontsource/oxanium` (latin 500/700/800) junto a Syne y Space Grotesk; todas con woff2/woff e unicode-range generado por fontsource, font-display: swap.

### Densidades de la imagen

Compuestas en `ResultImage` por formato (4:5, 9:16, 1:1) con tamaños por bloque separados (título, podio, filas, MVP, pie). Rango cómodo validado hasta 10 equipos con el fixture; la **división en varias imágenes ("Parte 1/2") para > ~16 equipos queda pendiente para la fase 4**, así como la variante "Resultados por sala".

### Exportación adelantada de la §9

Se implementó ya: import dinámico de `html-to-image`, exportación de calentamiento para Safari, `document.fonts.ready` + `img.decode()` antes de exportar, `pixelRatio: 2`, copiar al portapapeles con detección de `ClipboardItem` y fallback a descarga, nombre `resultados-<titulo>-<jornada>.png` sanitizado (NFKD, sin acentos ni caracteres raros). La imagen se renderiza a tamaño lógico fijo (1080×N) y la preview solo escala vía `transform: scale()`; se exporta el nodo interno sin escalar.

### Persistencia de imágenes: blob URLs revocadas

El logo y el fondo se guardan como `Blob` en IndexedDB (idb-keyval) y se muestran con `URL.createObjectURL`; cada URL se revoca al reemplazar o desmontar. Redimensionado en cliente con `createImageBitmap` + canvas (logo 512 px, fondo 2160 px, PNG optimizado). Los ajustes van a `localStorage` con `schemaVersion: 1`.

### Estado de exportación sin `alert()`

El estado del export (generando/copiado/fallo) se comunica con `role="status"`/`role="alert"` y `aria-live` en la UI; nunca con `alert()` (§7). El botón "Borrar mis datos" pide confirmación inline y también recarga limpia de estado en memoria.

### Tooling

- Build: `npm run build` = `typecheck && vite build` (tsc -b compuesto se omitió por simplicidad).
- `AGENTS.md` está fuera del formateo de Prettier (`.prettierignore`): es la especificación.
- `@typescript-eslint/no-unused-vars` con `argsIgnorePattern: '^_'` (convención para parámetros reservados, p. ej. en `componentDidCatch`).
- Se evitó la regla type-aware `prefer-nullish-coalescing` (requiere `parserOptions.project`).
- `jsx-a11y/label-has-associated-control` con `depth: 3` porque los labels anidan texto a 3 niveles (el default escanea 2); no es una supresión: el texto accesible existe y se escanea más profundo.
- Dependencia fijada: `es-abstract@1.23.9` resuelve un bug de resolución de `array.prototype.flat@1.3.3` con `es-abstract@1.24.2` (falta `2024/ArraySpeciesCreate`) que rompía ESLint vía `jsx-a11y`.
- Vitest: entorno `jsdom` por archivo (`@vitest-environment jsdom`) para el smoke test de `ResultImage`; el resto queda en `node`.

## Fase 2.5 — Perfeccionamiento de estilo, assets y responsivo

### Assets por defecto: convención `public/brand/`

El dueño aporta `logo.png` y `default-background.{svg,png}`. Se adoptó la convención `public/brand/{logo,background}.{png,svg}` (copias de los entregados). La resolución de imagen por defecto es: **1) archivos del dueño en `public/brand/` (png → svg), 2) fallback integrado en el build (`src/assets/`)**. Todo se convierte a data URL al arrancar para que la exportación PNG lo embeba sin fetch. Reemplazar un archivo en `public/brand/` actualiza el por defecto sin cambiar código.

### Carga instantánea de imágenes

API `show`/`commit` en `useStoredImage`: al elegir archivo se muestra el data URL del original de inmediato y en paralelo se optimiza (canvas) y se guarda en IndexedDB; la vista previa refleja el cambio al instante. Los SVG se guardan tal cual (escalan sin pérdida, sin canvas).

### Temas de diseño (presets)

`Settings.theme` con 4 presets (Verde torneo por defecto, Dorado real, Neón violeta, Acero frío) que fijan texto/acento y colorean el degradado de la imagen. Solo colores: las formas de la imagen no cambian (variante artística futura).

### Fechas

Formato canónico «12 OCT 2026» (mes abreviado es-MX sin punto) compartido entre formulario (`dateFormat.ts`) e imagen. El formulario muestra la vista previa del formato al escribir.

### Responsivo del editor

- Grid de 1 columna (móvil/tablet) con preview primero; 2 columnas desde `lg` con preview **sticky**.
- `min-w-0` en columnas y campos para evitar overflow con textos largos; inputs de texto a 16px en móvil (evita el zoom de iOS al enfocar).
- Botones de exportación a ancho completo en móvil.

### Persistencia v2

`SCHEMA_VERSION = 2` con migración por merge (configs v1 conservan sus valores y completan los nuevos: `theme`, `useDefaultLogo`, `useDefaultBackground = true`).

### Fuentes nuevas

@fontsource/rubik, archivo y sora (latin 700/800); el selector ofrece 6 fuentes autoalojadas. Solo se cargan los pesos display usados.
