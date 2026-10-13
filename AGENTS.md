# AGENTS.md — Generador de resultados de torneos

> Guía completa para el agente de código. **Léela entera antes de escribir una sola línea.**
> Si usas Claude Code, copia este archivo como `CLAUDE.md` (mismo contenido).

---

## 0. TL;DR — lo que NO se negocia

1. **100 % client-side y estático.** Sin backend, sin base de datos, sin funciones serverless, sin SSR. Todo corre en el navegador del usuario.
2. **Desplegable gratis en GitHub Pages Y en Vercel (plan gratuito).** El mismo build debe funcionar en ambos sin cambios de código (solo cambia la variable `VITE_BASE`).
3. **Cero costos y cero servicios externos en runtime.** Nada de CDNs, APIs, analíticas ni trackers. Las fuentes se autoalojan.
4. **Privacidad:** los archivos del usuario (`.log`, `.txt`, logo, fondo) **nunca salen de su equipo**.
5. **Buenas prácticas obligatorias:** TypeScript `strict`, sin `any`, lint + format, tests del parser y del motor de cálculo, commits convencionales, accesibilidad, código simple y modular.
6. **Rendimiento obligatorio:** bundle inicial pequeño, carga diferida de lo pesado (exportación a PNG), imágenes del usuario redimensionadas, preview fluido.
7. **Diseño ORIGINAL.** Existe una imagen de referencia de otra liga; **no se debe copiar**. Usa el sistema visual de la sección 8.
8. **UI en español (es-MX).** Identificadores de código, comentarios y commits en inglés.

---

## 1. Qué se construye

Una aplicación web de una sola página donde un organizador de torneos:

1. Carga uno o varios archivos de resultados `.txt` / `.log` (uno por sala/partida).
2. Llena datos del torneo: **título, jornada, fecha, moderador**.
3. Elige el **modo de cálculo** (por defecto: *score total estándar*) y el desempate.
4. Sube su **logo** y su **fondo** propios, y elige **tipo de fuente** y **color de fuente** (más color de acento).
5. Ve una **vista previa en vivo** y exporta una **imagen PNG** lista para compartir (4:5, 9:16 o 1:1), o la copia al portapapeles.
6. Guarda su configuración como **plantilla** reutilizable.

Es una herramienta pensada para organizadores de torneos de esports (el formato de log de la sección 4 proviene de una partida de Free Fire, pero el producto debe llamarse y comportarse de forma genérica: "resultados de torneo").

---

## 2. Stack (decidido)

| Área | Elección |
|---|---|
| Build | **Vite** + **React** + **TypeScript** (`strict: true`) |
| Estilos | **Tailwind CSS** (instalación oficial con el plugin de Vite) + variables CSS para el tema |
| Estado | `useState`/`useReducer` + **Zustand** solo si el estado compartido lo justifica |
| Exportar imagen | **html-to-image** (`toPng`), **importado dinámicamente** |
| Persistencia | **idb-keyval** (imágenes/blobs) + `localStorage` (ajustes ligeros) |
| Tests | **Vitest** (+ Testing Library solo para lo imprescindible) |
| Calidad | **ESLint** (typescript-eslint, react-hooks, jsx-a11y) + **Prettier** |
| Fuentes | **@fontsource** (autoalojadas): **Syne** (700/800) y **Space Grotesk** (400/500/700) |
| Gestor | **npm** (lockfile commiteado). Node LTS |

Reglas del stack:
- Usa las **versiones estables actuales** y fíjalas con el lockfile. No inventes APIs: consulta la documentación oficial de cada librería.
- **Prohibido:** Next.js/SSR, Electron/Tauri (por ahora), librerías de UI pesadas (MUI, Ant, Bootstrap), moment.js, lodash completo, jQuery.
- **Sin router.** Es una sola pantalla. (Evita el problema de rutas 404 de GitHub Pages.)
- Cada dependencia nueva debe justificarse (tamaño y necesidad). Prefiere código propio pequeño.

---

## 3. Estructura del proyecto

```
.
├─ AGENTS.md
├─ README.md
├─ DECISIONS.md              # decisiones que tomes donde este documento no dice nada
├─ index.html
├─ vite.config.ts
├─ package.json
├─ .github/workflows/deploy.yml
├─ public/                   # favicon, og-image
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ core/                  # TS PURO, sin React ni DOM (100 % testeable)
│  │  ├─ types.ts
│  │  ├─ parser/             # parseLog.ts, normalize.ts
│  │  ├─ engine/             # calculate.ts, tiebreak.ts, mvp.ts, presets.ts
│  │  └─ validation.ts
│  ├─ features/
│  │  ├─ upload/             # FileDropzone, FileList
│  │  ├─ tournament-form/    # título, jornada, fecha, moderador
│  │  ├─ calc-mode/          # modo + desempate + tabla de puntos
│  │  ├─ style-panel/        # logo, fondo, fuente, colores
│  │  ├─ preview/            # ResultImage (la imagen), PreviewFrame (escala)
│  │  └─ export/             # exportPng.ts, copyToClipboard.ts
│  ├─ storage/               # idb + localStorage + plantillas
│  ├─ i18n/es.ts             # todos los textos de la UI centralizados
│  ├─ styles/                # tokens.css, fonts.css
│  └─ utils/                 # imageResize.ts, debounce, etc.
└─ tests/
   ├─ fixtures/              # logs de ejemplo
   └─ *.test.ts
```

**Regla de oro:** `src/core/` no importa React, ni DOM, ni nada de `features/`. La lógica de negocio es pura y testeable.

---

## 4. Formato del archivo de entrada (CRÍTICO)

Cada archivo `.txt` / `.log` representa **una sala/partida**. Estructura: una línea por equipo, seguida de sus jugadores.

```
TeamName: INFERNAL FOX         Rank: 1      KillScore: 17      RankScore: 12      TotalScore: 29
NAME: IFX.GOSPEL⁷          ID: 10751652294          KILL: 4
NAME: IFX.PABLO15          ID: 2014454906           KILL: 2
NAME: IFX.Xndrez²⁶         ID: 1433966165           KILL: 4
NAME: IFX.astro10          ID: 656165934            KILL: 7
TeamName: TAURUS GAMER         Rank: 2      KillScore: 23      RankScore: 9       TotalScore: 32
NAME: TGㅤcambazn           ID: 12738517752          KILL: 4
...
```

El dueño proveerá un log real completo (`MatchResult_..._log.txt`, 10 equipos × 4 jugadores). **Úsalo como fixture de tests** en `tests/fixtures/`.

### Parseo
- Procesa **línea por línea**, haciendo `trim()` primero. Ignora líneas vacías.
- Equipo (nombre con espacios posible → captura perezosa):
  `/^TeamName:\s*(.+?)\s+Rank:\s*(\d+)\s+KillScore:\s*(\d+)\s+RankScore:\s*(\d+)\s+TotalScore:\s*(\d+)$/`
- Jugador:
  `/^NAME:\s*(.+?)\s+ID:\s*(\d+)\s+KILL:\s*(\d+)$/`
- Un jugador pertenece al **último equipo** leído. Jugador antes de cualquier equipo → advertencia, se ignora.
- Líneas que no coinciden con ningún patrón → **advertencia** (con número de línea), nunca un crash.
- Tolera `\r\n`, BOM UTF-8 y espacios múltiples.
- Lee el archivo como **UTF-8** (`file.text()`). Si detectas BOM UTF-16, decodifícalo con `TextDecoder('utf-16le')`.
- Límite de tamaño razonable (p. ej. 5 MB) y validación de extensión `.txt`/`.log`/`.log.txt`.
- IDs como **string** (pueden ser largos).

### Unicode (los nombres lo traen y se verá en la imagen)
- Los nombres incluyen caracteres como `ㅤ` (U+3164, "Hangul filler", usado como espacio invisible), superíndices (`⁷`, `²⁶`), kanji, símbolos y emojis.
- **Display:** conserva el nombre original, pero reemplaza U+3164 y otros invisibles por un espacio normal y haz `trim`. **No** apliques NFKC al texto mostrado (cambiaría `⁷` por `7`).
- **Clave de agrupación de equipos:** NFKC + quitar invisibles + colapsar espacios + mayúsculas. Solo para comparar/agrupar, nunca para mostrar.
- La imagen debe renderizar bien estos caracteres: usa una **pila de fuentes con fallback** (`'Space Grotesk', system-ui, 'Noto Sans', 'Segoe UI Symbol', sans-serif`) y prueba con el fixture.

### Hechos verificados en el log de muestra (úsalos como validaciones)
- `TotalScore = KillScore + RankScore` en cada equipo.
- `KillScore` del equipo = suma de `KILL` de sus jugadores.
- **El log viene ordenado por `Rank` (posición en la partida), NO por `TotalScore`.** Ej.: TAURUS GAMER (rank 2) tiene 32 y INFERNAL FOX (rank 1) tiene 29. **Nunca asumas que el orden del archivo es el orden del ranking final.**
- Si alguna validación falla, **no abortes**: muestra una advertencia visible y continúa.

---

## 5. Modelo de datos (TypeScript)

```ts
export type CalcMode = 'standard' | 'position-kills' | 'kills-only' | 'custom';
export type TiebreakRule = 'kills' | 'best-rank' | 'booyahs';

export interface PlayerEntry { name: string; id: string; kills: number }

export interface TeamEntry {
  name: string;            // nombre limpio para mostrar
  key: string;             // clave normalizada para agrupar
  rank: number;            // posición en la partida
  killScore: number;
  rankScore: number;
  totalScore: number;
  players: PlayerEntry[];
}

export interface ParseWarning { line: number; message: string }

export interface ParsedRoom {
  fileName: string;
  teams: TeamEntry[];
  warnings: ParseWarning[];
}

export interface TeamStanding {
  key: string;
  name: string;
  kills: number;
  booyahs: number;         // veces con rank === 1
  rankPoints: number;
  total: number;
  roomsPlayed: number;
}

export interface PlayerStanding { id: string; name: string; teamName: string; kills: number }

export interface Settings {
  title: string; matchday: string; date: string; moderator: string;
  mode: CalcMode; tiebreak: TiebreakRule[];
  positionPoints: number[];  // por defecto [12,9,8,7,6,5,4,3,2,1]
  killPoints: number;        // por defecto 1
  fontFamily: string; textColor: string; accentColor: string;
  format: '4:5' | '9:16' | '1:1';
}
```

---

## 6. Motor de cálculo (`src/core/engine`)

Funciones **puras**, sin efectos secundarios.

**Modos**
- `standard` (**por defecto**, "score total estándar"): usa `TotalScore` del log tal cual (valida `Kill + Rank`).
- `position-kills`: recalcula `rankScore` con la tabla `positionPoints` (default `12,9,8,7,6,5,4,3,2,1`, editable) y `kills × killPoints`.
- `kills-only`: solo kills.
- `custom`: tabla de puntos y multiplicador de kills definidos por el usuario.

**Acumulación multi-sala:** agrupa por `key` de equipo y suma kills, booyahs, rankPoints y total. Si hay nombres casi iguales entre salas (p. ej. distancia de edición ≤ 2), muestra una advertencia sugiriendo unirlos manualmente (la UI de unión puede ser fase 4).

**Booyah** = equipo con `rank === 1` en una sala.

**Orden final:** por `total` descendente y luego por la lista `tiebreak` (default: más kills → mejor rank → más booyahs → orden alfabético estable). El desempate debe ser configurable.

**MVP (Top 3 de kills):** suma kills por **`id` de jugador** (no por nombre) en todas las salas. Desempate: más kills → mejor puesto de su equipo → orden de aparición. Devuelve también el equipo del jugador.

**Resultado esperado con el log de muestra (usa estos valores como test):**

| # | Equipo | Kills | Booyahs | Rank pts | Total |
|---|---|---|---|---|---|
| 1 | TAURUS GAMER | 23 | 0 | 9 | 32 |
| 2 | INFERNAL FOX | 17 | 1 | 12 | 29 |
| 3 | TYPHON GAMING | 8 | 0 | 8 | 16 |
| 4 | LY GOLD | 8 | 0 | 7 | 15 |
| 5 | S7 GOLD | 9 | 0 | 5 | 14 |
| 6 | FLAMITA ESPORT | 7 | 0 | 6 | 13 |
| 7 | QUIMERA PRUEBA | 6 | 0 | 4 | 10 |
| 8 | UZX GOLD | 4 | 0 | 2 | 6 |
| 9 | GCL FFWS | 3 | 0 | 3 | 6 |
| 10 | APEX LEGACY | 1 | 0 | 1 | 2 |

Totales: **10 equipos, 1 sala, 86 kills, 143 puntos, 1 booyah.**
UZX GOLD queda sobre GCL FFWS por desempate de kills (4 > 3).
MVP: **#1** shadw9' INF (TAURUS GAMER) con **8** kills; **#2/#3** empatados con **7**: IFX.astro10 (INFERNAL FOX) y TG joãopene (TAURUS GAMER).

---

## 7. Interfaz del editor

Referencia: dos tableros de mockup ("Editor web" 1440 px e "Imagen exportada" 1080×1350). Si el dueño te da capturas, síguelas. Descripción:

**Editor (2 columnas):**
- **Izquierda, 4 pasos en tarjetas numeradas:**
  1. **Archivos de resultados:** zona de arrastrar/soltar **múltiple** (`.txt`, `.log`), lista de archivos cargados con estado ("Sala 1 · 10 equipos · ✓ kills validados"), botón quitar y advertencias.
  2. **Datos del torneo:** Título del torneo, Jornada, Fecha, Moderador.
  3. **Modo de cálculo:** opciones múltiples (Score total estándar *seleccionado por defecto*, Posición + kills, Solo kills, Personalizado) + selector de desempate. "Personalizado" abre la tabla de puntos editable.
  4. **Estilo:** subir **logo**, subir **fondo**, **tipo de fuente** (select), **color de fuente**, **color de acento**.
- **Derecha:** **vista previa en vivo** de la imagen final, selector de formato (4:5 / 9:16 / 1:1), y botones **Descargar PNG** (primario), **Copiar imagen**, **Guardar plantilla**. Texto de ayuda: "Se exporta a 2160 × 2700 px (2x)".
- Encabezado con marca y una etiqueta: "Todo se procesa en tu navegador · sin subir archivos".

**Requisitos de UX/a11y:**
- Responsive: en móvil las columnas se apilan y la vista previa va arriba o colapsable.
- `<label>` real en cada campo, foco visible, navegación por teclado, `aria-label` en botones solo-icono, contraste ≥ 4.5:1 en la UI.
- Estados vacíos claros, errores amables en español, nada de `alert()`.
- Si el usuario elige colores con bajo contraste para la imagen, muestra una advertencia no bloqueante.
- Todos los textos en `src/i18n/es.ts`.

---

## 8. Diseño visual de la imagen exportada (ORIGINAL — no copiar la referencia)

Identidad: **oscuro elegante, verde esmeralda + dorado suave**. Nada de rojo/amarillo estilo liga de referencia.

**Tokens (CSS variables; `--accent` y `--text` son configurables por el usuario):**
```css
--bg:#07100e; --surface:#0e1a17; --surface-2:#12241f; --row-alt:#0b1613;
--border:#1f3a33; --border-strong:#2a4a42; --track:#16302a;
--text:#f4efe6; --text-2:#b9cbc4; --muted:#8fa8a0;
--accent:#34d399; --gold:#e8c27a; --silver:#b8c4c0; --bronze:#c98b5a;
```
**Tipografía:** títulos y números grandes en **Syne 800**; resto en **Space Grotesk**. El selector "tipo de fuente" ofrece al menos 3 opciones autoalojadas.

**Composición (formato 4:5, lienzo lógico 1080×1350):**
1. **Cabecera:** logo circular (con *placeholder* si no hay), kicker `JORNADA [N] · [FECHA]` en acento, título grande, y píldoras con totales (equipos, salas, kills, puntos, booyahs).
2. **Podio:** top 3 en tarjetas de distinta altura (orden visual 2 – 1 – 3). El 1.º con borde dorado, número y puntaje más grandes. Cada tarjeta: posición, nombre, kills y booyahs, puntos.
3. **Posiciones 4 en adelante:** filas con barra de progreso proporcional al puntaje (relativa al líder) y columnas KILLS / BOOY / RANK / TOTAL. Filas alternadas con `--row-alt`.
4. **MVP:** tres tarjetas (#1 dorado, #2 plata, #3 bronce) con jugador, equipo y kills.
5. **Pie:** `MODERADOR · [NOMBRE]` y sala/booyah.
6. **Fondo:** anillos decorativos (círculos con borde, baja opacidad). Si el usuario sube **fondo propio**: úsalo como capa inferior con un *scrim* oscuro (opacidad ajustable, por defecto ~65 %) para garantizar legibilidad.

**Otros formatos:** 9:16 (1080×1920) usa más alto para filas más cómodas; 1:1 (1080×1080) compacta podio + lista (y reduce MVP a una línea).

**Casos límite (obligatorio manejarlos):**
- Equipos: 3 a ~24. Define densidades (cómodo ≤ 10, compacto 11–16) y, si no cabe, **divide en varias imágenes** ("Parte 1/2"). Con menos de 3 equipos, el podio se adapta.
- Nombres largos: truncar con elipsis o reducir tamaño; nunca romper el layout.
- Sin logo / sin fondo / campos vacíos: placeholders discretos; **los placeholders `[...]` no deben aparecer en la exportación final**, solo en el editor.
- Texto del usuario siempre escapado (React lo hace; **prohibido `dangerouslySetInnerHTML`**).

---

## 9. Exportación PNG (zona delicada)

- Renderiza `ResultImage` a **tamaño lógico fijo** (p. ej. 1080×1350). La vista previa solo lo **escala con `transform: scale()`** dentro de un contenedor; **exporta desde el nodo sin escalar** (o un clon) para evitar imágenes borrosas o recortadas.
- Importa `html-to-image` con `import()` dinámico **solo al exportar** (no entra al bundle inicial).
- Antes de exportar: `await document.fonts.ready` y espera a que las imágenes (logo/fondo) estén decodificadas (`img.decode()`).
- `toPng(node, { pixelRatio: 2, cacheBust: false })`. Resultado ≈ 2160×2700.
- **Imágenes del usuario como data URL / blob URL locales** (nunca remotas) para evitar canvas contaminado (CORS).
- Fuentes autoalojadas, para que html-to-image pueda incrustarlas.
- Problema conocido: en Safari la primera exportación a veces sale sin imágenes/fuentes. Mitiga con una exportación de "calentamiento" o reintento y documéntalo en el README.
- **Copiar al portapapeles:** `navigator.clipboard.write([new ClipboardItem({'image/png': blob})])` con detección de soporte; si falla, ofrece descargar.
- Nombre de archivo: `resultados-<titulo>-<jornada>.png` (sanitizado, sin caracteres raros).
- Muestra estado de progreso y errores comprensibles. Revoca `URL.createObjectURL` cuando ya no se usen.

---

## 10. Persistencia y plantillas

- **Imágenes (logo/fondo):** IndexedDB (`idb-keyval`) como Blob. **Ajustes:** `localStorage` con **versión de esquema** (`schemaVersion`) y migraciones simples.
- Envuelve **todo** acceso a storage en `try/catch` (modo privado, cuota llena) y degrada con elegancia: la app debe funcionar aunque el storage falle.
- **Plantilla** = ajustes de estilo + (opcional) imágenes. Exportar/importar como **JSON** (imágenes embebidas en base64; avisa del tamaño).
- Botón **"Borrar mis datos"** que limpia IndexedDB y localStorage.
- Los logs cargados **no se persisten** por defecto (privacidad); solo la configuración.

---

## 11. Rendimiento (obligatorio)

- **Presupuesto:** JS inicial ≲ 200 KB gzip. Verifica con `vite build` y, si hace falta, `rollup-plugin-visualizer` (solo dev).
- **Code-splitting:** `html-to-image` y la lógica de exportación se cargan bajo demanda; separa `react`/`react-dom` en su chunk (`manualChunks`).
- **Fuentes:** `@fontsource` con subsets **latin** y **latin-ext** únicamente, `font-display: swap`, solo los pesos usados, formato woff2.
- **Imágenes del usuario:** al subirlas, **redimensiona** en cliente (`createImageBitmap` + canvas) a un máximo razonable (≈ 2160 px lado largo; logo ≈ 512 px), valida tipo (PNG/JPG/WebP) y tamaño (p. ej. ≤ 8 MB de entrada) y guarda la versión optimizada.
- **Preview fluido:** debounce de inputs de texto (~150 ms) o `useDeferredValue`; `React.memo` en filas/tarjetas; evita re-renderizar la imagen entera por cada tecla; sin layout thrashing.
- Parseo: es ligero; solo mueve a un Web Worker si mides que bloquea la UI con archivos grandes.
- **Sin dependencias en runtime hacia internet** (ni Google Fonts, ni CDNs). Todo sale del propio build.
- Assets con hash en el nombre (Vite lo hace) → caché larga automática.
- Lighthouse (móvil) objetivo: Rendimiento ≥ 90, Accesibilidad ≥ 95, Buenas prácticas ≥ 95.

---

## 12. Despliegue: GitHub Pages **y** Vercel (gratis)

**Reglas para que funcione en ambos:**
- Sin router, sin rutas absolutas. Para assets de `public/` usa `import.meta.env.BASE_URL`.
- La base se configura por variable de entorno:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// + el plugin de Tailwind según su guía oficial para Vite

export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react() /*, tailwind() */],
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: { manualChunks: { react: ['react', 'react-dom'] } },
    },
  },
});
```

**GitHub Pages** (`.github/workflows/deploy.yml`) — la base es `/<nombre-del-repo>/`:

```yaml
name: Deploy to GitHub Pages
on:
  push: { branches: [main] }
  workflow_dispatch: {}
permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: pages, cancel-in-progress: true }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint && npm run test && npm run build
        env:
          VITE_BASE: /${{ github.event.repository.name }}/
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```
> Verifica las versiones más recientes de cada *action* antes de fijarlas. En el repo: Settings → Pages → Source: **GitHub Actions**.

**Vercel (plan gratuito):** importar el repo; preset **Vite**; build `npm run build`; output `dist`; **sin** `VITE_BASE` (usa `/`). No se necesita `vercel.json` (no hay router ni rewrites). No uses Serverless/Edge Functions, KV ni nada de pago.

**SEO/PWA mínimos:** `<title>`, meta description, `lang="es"`, favicon, imagen OG. Una PWA offline (vite-plugin-pwa) es **opcional** y solo en la fase 5; si se hace, respeta `base`.

---

## 13. Calidad y buenas prácticas

- `tsconfig`: `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`. **Prohibido `any`** (usa `unknown` + narrowing).
- Scripts en `package.json`: `dev`, `build`, `preview`, `lint`, `format`, `test`, `typecheck`.
- **Tests obligatorios** (Vitest) para `core/`:
  - Parser: fixture real, nombres con unicode/`ㅤ`, `\r\n`, BOM, líneas basura, jugador sin equipo, archivo vacío.
  - Motor: los valores exactos de la tabla de la sección 6, cada modo, cada desempate, acumulación multi-sala, MVP por ID.
- Componentes pequeños, un propósito cada uno, props tipadas, sin lógica de negocio dentro de JSX.
- Manejo de errores explícito: ningún archivo malformado debe tumbar la app. Usa un *Error Boundary* en la raíz.
- **Seguridad:** sin `eval`, sin `dangerouslySetInnerHTML`, validar tipo/tamaño de archivos, no cargar scripts externos. Opcional: `<meta http-equiv="Content-Security-Policy">` restrictiva (`img-src 'self' data: blob:`, `font-src 'self'`, `connect-src 'self'`).
- **Git:** commits convencionales (`feat:`, `fix:`, `test:`, `chore:`, `docs:`), commits pequeños, `.gitignore` correcto, sin secretos.
- **README.md:** qué es, cómo correrlo, formato de log soportado, modos de cálculo, cómo desplegar en Pages y Vercel, limitaciones conocidas (Safari), licencia placeholder.
- **DECISIONS.md:** cada vez que decidas algo no cubierto aquí, anótalo (qué, por qué).

---

## 14. Plan por fases (no saltes fases; cada una termina con `lint`, `typecheck`, `test` y `build` en verde)

**Fase 1 — Núcleo (sin UI):** `core/types`, parser, normalización, validaciones, motor de cálculo (modo estándar + desempate + MVP + booyahs + multi-sala) y tests con el fixture real.
*Aceptación:* la tabla de la sección 6 se reproduce exactamente.

**Fase 2 — Editor y preview:** layout de 2 columnas, carga de archivos, formulario del torneo, selector de modo, `ResultImage` (formato 4:5) con los tokens de la sección 8, preview escalado.
*Aceptación:* subir el log de muestra muestra el podio, las filas y los MVP correctos.

**Fase 3 — Estilo y exportación:** logo y fondo propios (con redimensionado), fuente y colores, exportar PNG 2x, copiar al portapapeles, formatos 9:16 y 1:1.
*Aceptación:* el PNG descargado coincide con el preview y muestra bien nombres con unicode.

**Fase 4 — Robustez y extras:** persistencia, plantillas JSON, modos `position-kills`/`kills-only`/`custom` con tabla editable, multi-sala con "Resultados por sala", densidades y división en varias imágenes, advertencias de nombres similares.

**Fase 5 — Pulido y despliegue:** accesibilidad, Lighthouse, README, workflow de GitHub Pages, verificación en Vercel, (opcional) PWA.
*Aceptación:* la misma base de código despliega en ambos servicios; las métricas de la sección 11 se cumplen.

---

## 15. Anti-objetivos (no lo hagas)

- No agregues backend, auth, base de datos ni cuentas de usuario.
- No subas ni envíes archivos del usuario a ningún servidor.
- No uses Electron/Tauri ni conviertas esto en app de escritorio (podría evaluarse después envolviendo el mismo código web).
- No copies el diseño de la imagen de referencia de otra liga ni uses sus marcas/logos.
- No instales frameworks de componentes pesados ni dependencias "por si acaso".
- No dejes `console.log`, código muerto ni `TODO` sin issue/nota.

---

## 16. Forma de trabajo

1. Lee este documento completo. Si algo es ambiguo y **bloquea**, pregunta; si no, **decide con los valores por defecto** y regístralo en `DECISIONS.md`.
2. Trabaja por fases (sección 14). Al terminar cada una, ejecuta `npm run lint && npm run typecheck && npm run test && npm run build` y corrige antes de avanzar.
3. Mantén `core/` puro y probado: es el corazón del producto.
4. Al final de cada fase, resume qué hiciste, qué decidiste y qué queda pendiente.

**Definición de terminado del proyecto:**
- [ ] Carga uno o varios `.txt/.log` y produce la clasificación correcta (tabla de la sección 6 verificada con test).
- [ ] Todos los campos pedidos existen: modo de cálculo (opciones múltiples, estándar por defecto), moderador, logo, fondo, título, jornada, fecha, fuente y color, carga de archivo.
- [ ] Exporta PNG nítido (2x) y copia al portapapeles.
- [ ] Funciona sin servidor en GitHub Pages **y** Vercel gratis, con el mismo build.
- [ ] Sin llamadas de red en runtime con datos del usuario; fuentes autoalojadas.
- [ ] Tests, lint, typecheck y build en verde; README y DECISIONS completos.
- [ ] Rendimiento y accesibilidad dentro de los objetivos de la sección 11.
