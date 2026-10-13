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

## Fase 4 — Sistema de plantillas (según TEMPLATES.md)

### Alcance de esta fase: T0 + T1 + Recibo

Implementado: cimientos (ViewModel, códigos de 3 letras, formatos, titulares, PRNG con semilla, procesadores de imagen con caché), plantillas **Corona** ( conversion de la imagen previa a plantilla), **Gaceta** y **Marcador** (lote T1), más **Recibo** como adelanto del lote T3 (el dueño pidió "otras aparte"). Pendientes para lotes siguientes: Telemetría, Plano, Suizo (T2) y Cartel, Arcade, Zine (T3), la hoja de contactos (`npm run contact-sheet`), la división en varias imágenes (`density: multi`) y los test de Safari.

### Editor de 5 pasos

El paso 4 se convirtió en **Plantilla** (galería con miniaturas reales de 96 px renderizadas a 1080 y escaladas con transform en capa exterior) y el 5 es **Personalización** (acotada por plantilla: Corona pinta color/acento/fuente y presets de tema; Gaceta solo acento; Marcador y Recibo solo acento). Persistencia v3 con migración por merge (`templateId` + `styleByTemplate`).

### Plantillas como JSON

`Exportar plantilla (JSON)` descarga settings + logo/fondo embebidos en base64; `Importar` valida (`app: 'laurel-template'`) y aplica con `commit` de imágenes. Todo local, sin subir nada.

### Procesado de imágenes por receta

`processImage` aplica la receta de cada plantilla al logo/fondo (Corona `scrim`/`original`, Gaceta `mono-ink`/`grayscale`, Marcador `amber`, Recibo `dither`/`scrim`) con caché por `(hash, receta, params)`, acotando el lado a 1200 px. Las funciones de píxel viven en `features/assets/recipes.ts` (puras, testeadas con buffers RGBA conocidos); el canvas solo carga/guarda.

### Reglas aceptadas de la spec

- Titulares generados: solo hechos del ViewModel, deterministas con la semilla (`title|matchday|líder|total`).
- Sin `Math.random()` en render; imperfecciones deterministas solo en Recibo/Cartel/Zine.
- Fuente por plantilla: `@fontsource/bodoni-moda + source-serif-4 + ibm-plex-mono` (Gaceta), `vt323 + share-tech-mono` (Marcador), `cutive-mono + courier-prime` (Recibo), cargadas con `import()` perezoso por plantilla (`shared/fonts.ts`), nunca en el bundle inicial.
- `fitText` como utilidad compartida (no: todas las plantillas usan truncado con elipsis por elipsis segura; fitText queda disponible para los lotes T2/T3).

### Detección de plantilla activa y fallback de ejemplo

Sin logs cargados, el preview y la galería usan VM de ejemplo del fixture integrado (`src/assets/sample_log.txt`, copia del fixture de tests descubierta inicialmente desde `tests/` — movida a assets para no cruzar carpetas en el build). Con logs reales, el VM se construye del engine.

## Fase 5 — Reescritura de plantillas según TEMPLATESv2

### Motivo

`TEMPLATESv2.md` reemplaza a `TEMPLATES.md`: las plantillas ya no son conceptos distintos
(periódico, ticket, marcador LED…) sino **10 variantes de UNA misma estructura** (la de
Corona). Se eliminaron **Gaceta, Marcador y Recibo** con todo su código, estilos y fuentes.

### Arquitectura adoptada (§2)

- Un único componente `src/features/templates/ResultImage.tsx` compone el esqueleto:
  `Decor → Header → (MVP si before-list) → Podium → StandingsList → (MVP si after-list) → Footer`.
- Las secciones (`sections/Header|Podium|StandingsList|MvpBlock|Footer|Decor.tsx`) implementan
  las variantes exactas de la §4 y solo leen el objeto `Scene` (ViewModel + tokens derivados +
  geometría): sin lógica de negocio.
- **Agregar una plantilla = agregar un objeto** en `templates.ts` (id, tokens, variantes,
  par de fuentes). La tabla 5.1 y los tokens 5.2 van copiados tal cual; ningún override creativo.

### Tokens y utilidades

- `tokens.ts`: `mix()` (sRGB), `readableOn()` (WCAG ≥ 4.5), `deriveTokens()`
  (`rowAlt`, `track`, `text2`, plata/bronce por tema, `onAccent`), radios y `positionLabel`
  (`pad`/`plain`/`hash`/`ordinal`). La transparencia decorativa usa `color-mix`, nunca filtros.
- Test de "≥ 3 cambios respecto a Corona" en `tests/templates.test.tsx` (§1.3).

### Tipografías (§6)

- Biblioteca de pares P1–P10 en `fonts.ts` con imports dinámicos por `import()`: solo
  latin + latin-ext, pesos usados. P1 (Syne + Space Grotesk) sigue en el bundle inicial;
  el CSS inicial se recortó a ese par (se quitaron Oxanium/Rubik/Sora/Archivo del arranque).
- Sustitución documentada: `share-tech-mono` no publica subset `latin-ext` (cobertura limitada
  del paquete); se importa solo su `latin` — el fallback system cubre el resto.

### Personalización y persistencia

- Acento, texto y par de fuentes ahora son editables **en todas** las plantillas (§7);
  se eliminó el fieldset de "temas" exclusivo de Corona y el uso de `THEMES`
  (`core/style/themes.ts` borrado; el campo `theme` persistido queda inert por compatibilidad).
- `fontFamily` ahora guarda el **id del par** (`p1…p10`); `loadSettings()`/`sanitizeSettings()`
  normalizan valores legados/externos a pares y plantillas válidos.
- El scrim del fondo se hornea siempre vía `processImage('scrim')` con **tinta según el tema**
  (oscura en dark, clara en light); `applyScrim()` acepta tinta opcional (tests actualizados).

### Geometría y multi-imagen

- `GEOMETRY` por formato (4:5 base; 9:16 y 1:1 recomponen alturas, no escalan). 1:1 omite
  píldoras y force el MVP `strip` por densidad de espacio.
- Densidad: `comfortable ≤ 10 · compact 11–16 · multi > 16`. `multi` recorta la lista a la
  capacidad del lienzo y el pie marca «Parte 1/2». La **selección de página** (navegar 1/2…2/2)
  queda pendiente de interfaz; hoy siempre se exporta la parte 1.

### Rendimiento (§8)

- JS inicial del entry principal ≈ 21 KB gzip (main+index+react); el chunk compartido
  `fonts-*.js` (81 KB gzip, react-dom + fixture de ejemplo) se **module-preloads** por
  dependencia entre entries pero no bloquea la ejecución inicial: total en red ≈ 102 KB
  gzip, dentro del presupuesto ≲ 200 KB (AGENTS §11). Pulido posible pendiente: mover el
  fixture de ejemplo a un import() `?raw` diferido.
- Los CSS de P2–P10 quedan como chunks diferidos individuales (verificados en dist/).

### Hoja de contactos (§10)

- `npm run contact-sheet` (página multi-entry de Vite, `contact-sheet.html`) renderiza las 10
  plantillas con el log de muestra en 4:5. La verificación visual («misma familia» vs «solo
  cambio de color») queda al ojo del dueño: en este entorno no hay navegador para capturar.
