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

## Ronda AJUSTES.md 1 — solo plantillas (P0.1 + P1.1 + P1.2)

### Overrides de estilo por plantilla, sin globales (P0.1)

- Se eliminaron los campos GLOBALES `accentColor`, `textColor` y `fontFamily` de `Settings`:
  eran la causa de que "Selva" pintara con el acento esmeralda de Corona. El estilo del
  usuario vive únicamente en `styleByTemplate[templateId]`; sin override manda el token/par
  de `templates.ts`. `StylePanel` muestra el valor efectivo (override > token) pero solo
  escribe un override cuando el usuario mueve el control.
- `SCHEMA_VERSION = 4`. La migración v3→v4 mueve lo que había en los campos globales a un
  override de **la plantilla que estaba activa al guardar** (lo que el usuario realmente
  veía), sin copiarlo al resto; si coincidía con los defaults v3 no se crea override.
- Al cambiar de plantilla se carga su `fontPairId` por defecto (o el override propio) y se
  actualizan las CSS vars `--font-display`/`--font-body` del editor; la exportación ya
  esperaba `document.fonts.ready`.

### selva → arena y pista a clara (P1.2)

- `selva` se renombró a `arena` con identidad CLARA (arena/terracota/teal, tokens de
  AJUSTES.md) y `migrateTemplateId()` traduce el id viejo en storage e importación JSON.
- `pista` pasó a clara (concreto + naranja `#e8590c`). Resultado: 4 claras (Marfil, Hielo,
  Arena, Pista) y 6 oscuras con tonos distintos. El acento de Pista da ~2.9:1 contra su bg
  (el spec fija esos hexes); la lectura de chips/barras es ≥ 4.5:1 vía `readableOn` (texto
  oscuro sobre el naranja), que es el par que realmente se lee.

### Galería (P1.1)

- `Picker` pasó a `role="radiogroup"` con cuadrícula de 2 columnas, miniaturas reales a escala
  ≥ ~200 px (ResizeObserver + carga perezosa con IntersectionObserver), marca de selección
  visible (✓ + borde accent), flechas/Home/End, y etiquetas en español vía `i18n.picker`
  (`Oscura · Podio en fila · Barras`). El estado de selección vive en props (antes había un
  `useState` local que se desincronizaba al importar un JSON). La columna izquierda del editor
  se amplió a 460 px para que las miniaturas alcancen el ancho mínimo.

## Ronda de motion (skills improve-animations / review-animations)

- Auditoría con la skill `improve-animations` (barra de Emil Kowalski) sobre `8a07b83`; los
  planes viven en `plans/` (001–004, todos ejecutados). Scope: SOLO el chrome del editor —
  la imagen exportada sigue siendo un PNG estático y no lleva motion (el fade de preview vive
  en el contenedor externo de `TemplateFrame`, nunca en el nodo exportable).
- Tokens nuevos en `tokens.css`: `--ease-out: cubic-bezier(0.23,1,0.32,1)` e `--ease-in-out`.
  Clases globales en `app.css`: `.pressable` (scale 0.97 / 160 ms), `.notice` (entrada 150 ms
  y salida con fade), `.preview-fade` (180 ms), `.file-row-enter` (150 ms); todas con rama
  `prefers-reduced-motion` que quita movimiento y conserva opacidad.
- Avisos de estado: «PNG descargado» se auto-oculta a los 4 s con fade (AJUSTES.md P0.2) y
  `patch()` limpia el estado pegajoso.
- Candidatos rechazados por restricción: hover-scale en tarjetas de plantilla, stagger de
  pasos al cargar, motion en el radio de formato (alta frecuencia → instantáneo). Detalle en
  `plans/README.md`.

## Ronda TEMPLATES-FREEFIRE.md — 3 plantillas FF + movimiento del editor

Spec: `TEMPLATES-FREEFIRE.md` (extensión de TEMPLATESv2; FF gana en movimiento,
v2 gana en visuales de la imagen exportada).

### Catálogo y tipos

- 3 plantillas nuevas como **variantes de Corona** (solo objetos en `templates.ts`):
  `booyah` (§3.1), `zona-roja` (§3.2) y `kalahari` (§3.2), con `category: 'free-fire'`
  y tokens/variantes copiados tal cual de la spec. Las 10 v2 llevan `category: 'general'`.
- `DecorV += 'chevrons' | 'zone'` implementadas en `Decor.tsx` con la geometría exacta
  de §4 (chevrons: 3 polígonos 22 px, opacidades .9/.55/.3, esquina superior derecha;
  zone: anillos r160/300/460 —medio dashed—, cruceta 40 px, punto 6 px `accent2`,
  anclaje 180/200 px, `strokeLinecap` según `config.radius`).
- P11–P13 en `fonts.ts` con `import()` perezoso (latin + latin-ext). Paquetes nuevos:
  `big-shoulders-display`, `saira-extra-condensed`, `saira`, `alfa-slab-one`,
  `barlow-semi-condensed` @5.3.0.
- `big-shoulders-display` **no** publica la clave `"./*.css"` en `exports` (solo `"./*"`),
  así que sus 4 imports van **sin extensión** (`@fontsource/big-shoulders-display/latin-800`);
  se declaró `declare module '@fontsource/big-shoulders-display/*'` en `vite-env.d.ts`.

### Sello BOOYAH, scrim y fondo por defecto

- Sello: `config.id === 'booyah' && position === 1 && row.booyahs > 0`; texto
  `Booyah ×N` con `textTransform: 'uppercase'` (el pie usa `Booyah × N` con espacio —
  el test los distingue con `/Booyah ×\d/`).
- Scrim del logo/fondo horneado con el **bg de la plantilla** (`hexToRgb(template.tokens.bg)`),
  no con el hardcode de Corona; así Booyah/Zona Roja tiñen oscuro y Kalahari claro (§7).
- Fondo por defecto solo en templates **oscuros** (`theme === 'dark'`); las claras van con
  color plano `bg` + decoración (v2 §7 y FF §7 para Kalahari).
- El header `split` conserva las cifras compartidas (equipos/salas/kills/puntos); NO se
  cambia a booyahs (v2 §7 manda en visuales de la imagen exportada).

### Movimiento del editor (FF §6)

- `app.css` reescrito con los valores de §6: press 120 ms, crossfade 140 ms, notice
  200 ms desde 8 px (salida solo opacidad 120 ms), card `:active` 0.97, hover lift 2 px
  solo fine-pointer, borde selección 160 ms, stagger 30 ms/máx. 10 con `translateY(8px)`,
  tabs indicador `translateX` 200 ms, `podium-reveal` 220 ms con escalón 40 ms. Rama
  reduced-motion conserva opacidad ≤ 120 ms.
- `TemplateProps.reveal?: boolean` (default false): la galería y la hoja de contactos
  renderizan estáticas; solo el preview de App pasa `reveal`. El estado vive en App y se
  resetea (true → false a los 600 ms) al cambiar `settings.matchday`.
- Crossfade de preview en dos capas (`SharedFrame`): capa fantasma con el contenido
  anterior (160 ms) + capa nueva. Teclado (flechas/Home/End) marca `{instant: true}` →
  `fade={false}` → sin crossfade (§6.2). El clic del ratón sí lo permite.
- `.file-row-enter` eliminado de `app.css` (la tabla §6.2 es exhaustiva y no lo incluye;
  la clase se quitó de `FileList.tsx`).

### Aislamiento de exportación (FF §6.3)

- `exportPng` marca `data-capture="true"` en el nodo, espera `document.fonts.ready`,
  `img.decode()` y `getAnimations({subtree: true})` (guard `typeof`, fallback silencioso),
  y quita el atributo en `finally`. Una regla CSS anula transiciones/animaciones dentro
  del nodo capturado → el PNG es idéntico con o sin movimiento en el editor.

### Galería (FF §7)

- `Picker` con pestañas `role="tablist"` (Todas · General · Free Fire), `radiogroup`
  filtrado, insignia de texto `FF` en las 3 plantillas, borde de selección por opacidad
  (160 ms), radius externo de tarjeta `12 + config.radius * 0.4` (§6.4), stagger solo
  en los primeros ~700 ms tras montar. Navegación por flechas/Home/End sobre la lista
  **visible**; el foco se reaplica con `requestAnimationFrame`.
- i18n: `picker.tabsLabel`, `picker.tabs {all, general, free-fire}`, `badge: 'FF'`.

### Verificación

- typecheck, eslint (`npx eslint src`), 118/118 tests y build en verde.
- Tests nuevos/actualizados: catálogo 13 (tabla 5.1 + 3.1/3.2, category, 5 claras/8 oscuras,
  font pairs p1–p13), render de las 13 + sello BOOYAH + reveal, picker con pestañas/FF/instant.
- El warning «same key, 14» del render de filas es preexistente (existe en main).

## Rediseño de UI (UI-REDESIGN.md — «Mesa de producción»)

### Alcance y precedencia

- La imagen exportada, `ResultImage`, `templates.ts` y el pipeline de exportación NO se
  tocaron: siguen `TEMPLATESv2.md` + `TEMPLATES-FREEFIRE.md`. El rediseño es solo el
  chrome del editor (tokens, layout, componentes, copy, motion del editor).
- Skills de `skills/` leídas (resumen ejecutivo vía subagente): `redesign-existing-projects`,
  `design-taste-frontend`, `minimalist-ui`, `high-end-visual-design`, `apple-design`,
  `brandkit`, `emil-design-eng`+`animation-vocabulary`+`animation-performance`,
  `break-ui`+`review-animations`, `full-output-enforcement`. NO se usaron `gpt-taste` ni
  `stitch-design-taste` (fuera de la lista de §1).

### Tokens y tipografía de UI

- Nuevos tokens de chrome (§3.1) en `tokens.css`: `--bg:#141311`, `--stage:#0e0d0c`,
  `--line`, `--line-strong`, `--text`, `--text-2`, `--text-3`, `--accent:#b9d77a`,
  `--danger`, `--btn-primary-bg/-fg`, `--font-ui`, `--font-mono`, easings.
- ELIMINADOS del chrome (solo se usaban en la UI vieja): `--surface`, `--surface-2`,
  `--row-alt`, `--border`, `--border-strong`, `--track`, `--muted`, `--gold`, `--silver`,
  `--bronze`, `--font-display`, `--font-body`. Las plantillas reciben colores/fuentes
  por props, no por CSS vars de chrome.
- `@fontsource/schibsted-grotesk` (UI) + IBM Plex Mono (números/metadatos) instalados;
  Syne/Space Grotesk siguen en bundle inicial (par P1) y P2–P13 lazy.
- `App.tsx` ya no hace `setProperty('--font-display'/'--font-body')`; solo `loadFontPair`.
  `contact-sheet/main.tsx` usa `--font-ui` en su h1.

### Layout y componentes

- Barra superior 56 px: marca, título en vivo (`liveTitle`), «Borrar datos» con
  confirmación inline de 4 s (sin `alert()`).
- Columna izquierda 400 px con secciones colapsables 01–05 (`Section`: número mono +
  título, filete 1 px, cerrada resume en una línea con «Editar»).
- **05 Estilo** (decisión): UI-REDESIGN §4 solo dibuja 01–04, pero AGENTS.md exige
  logo/fondo/fuente/color → se añade una 5.ª sección con el mismo patrón.
- Columna derecha (`--stage`): escenario con la imagen lo más grande posible sin scroll
  (`TemplateFrame` acepta `maxHeight` y centra con flex; escala = min(ancho, alto)),
  etiqueta mono «EJEMPLO» cuando no hay salas, selector de formato con subrayado
  (`underline-tab`, no `translateX`), botones hueso + resolución mono, tira de plantillas
  siempre visible (escritorio) o bottom sheet (móvil < lg).
- `Picker` reescrito como tira horizontal: miniaturas reales de 150 px (4:5), filete de
  selección accent 2 px fuera (opacidad 160 ms), nombre 13/500 + mono 11 `claro`/`oscuro`
  (sin descripciones largas), pestañas como texto con subrayado, scroll-snap, teclado
  con cambio instantáneo. Roles/ids/instant conservados para tests.
- `TiebreakList` (nuevo): desempate ordenable con toggles (settings.tiebreak = enabled
  en orden), drag HTML5 desde el tirador `⋮⋮` (handlers en el botón, no en el li, por
  a11y), botones ↑↓ visibles en focus/hover, `Alt+↑/↓` y `aria-live`.
- `CalcModePanel`: radios sin cajas, barra vertical 2 px accent al seleccionar; tabla
  Personalizado/Posición+Kills sangrada con fade; desempate ya NO vive aquí (paso 04).
- `FileDropzone`: filete punteado 96 px / compacto «Añadir más»; `FileList`: filas mono
  `archivo · N equipos · M kills` + quitar; avisos fuera del dropzone (ya no es wrapper
  de children).
- `ErrorBoundary` con tokens nuevos.

### Copy (§6)

- `i18n/es.ts` reescrito: sentence case, sin emojis/¡!/¡Listo!; secciones `{files,info,mode,tiebreak,style,edit}`; `upload.*`, `mode.*` (con `tiebreakNote/moveUp/moveDown/tiebreakOrder`), `picker.*` (`openSheet/closeSheet/theme{claro,oscuro}`), `privacy`, `liveTitle()`, `preview.*`. ELIMINADOS: `tagline`, `privacyBadge`, `steps.*`, `upload.{dropTitle,dropSubtitle,chooseButton,empty,killsValidados,advertencias}`, `form.dateHint`, `style.theme*`, `preview.{emptyTitle,emptyBody,help,selectFilesFirst}`.

### Motion (§8)

- `app.css` con: press 0.97, notice 200/120 ms, preview crossfade 140 ms, podium-reveal
  220 ms, fade-content 120 ms (secciones), underline-tab (opacidad del filete 200 ms,
  decisión: `border-bottom` con transición en vez de `translateX` compartido),
  sheet-in 200 ms (bottom sheet móvil), strip-scroll (snap sin barra), reduced-motion
  con opacidad ≤ 120 ms.

### Verificación

- typecheck, eslint (`npx eslint src`), prettier, 118/118 tests y build en verde.
- Test actualizado: `template-style.test.tsx` captions del strip (nombre + `claro`/
  `oscuro`; 8 oscuras / 5 claras — se corrigió el conteo: Marfil, Pista, Arena, Hielo y
  Kalahari son claras).
- `npm run lint` repo-wide sigue roto por `.agents/` y `AJUSTES.md` (preexistente en
  main); usar comandos scoped.
- Warning preexistente «same key, 14» en main (no introducido por el rediseño).
