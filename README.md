# Laurel · Resultados de torneos

Generador de imágenes de resultados de torneos: carga los logs de tus partidas (`.txt` / `.log`), configura los datos del torneo y exporta una imagen PNG lista para compartir.

**100 % client-side y estático:** todo se procesa en el navegador, sin backend ni llamadas de red con datos del usuario. Desplegable gratis en GitHub Pages y Vercel.

## Estado

- ✅ **Fase 1 — Núcleo:** parser del formato de resultados y motor de cálculo (estándar, posición+kills, solo kills, personalizado), desempates configurables, MVP, booyahs y acumulación multi-sala.
- ✅ **Fase 2 — Editor y vista previa en vivo.**
- ✅ **Fase 3 — Estilo personalizable y exportación PNG** (2x, copiar al portapapeles, formatos 4:5 / 9:16 / 1:1).
- ✅ **Fase 4 — Persistencia, plantillas y extras** (IndexedDB + localStorage, plantillas JSON, 13 plantillas TEMPLATESv2 + Free Fire, multi-sala).
- ✅ **Rediseño de UI** («Mesa de producción»): chrome del editor sin tarjetas, filetes 1 px, neutro cálido, Schibsted Grotesk + IBM Plex Mono, tira de plantillas, copy sentence case. La imagen exportada no cambió.
- ✅ **Despliegue:** workflow de GitHub Pages y Vercel listos (mismo build, `VITE_BASE`).

## Cómo correrlo

```bash
npm install
npm run dev        # servidor de desarrollo
npm run test       # tests (Vitest)
npm run lint       # prettier --check + eslint
npm run typecheck  # tsc --noEmit
npm run build      # build de producción (dist/)
npm run preview    # sirve el build
```

## Formato de log soportado

Cada archivo es una sala/partida: una línea por equipo con sus métricas y, debajo, una línea por jugador:

```
TeamName: INFERNAL FOX         Rank: 1      KillScore: 17      RankScore: 12      TotalScore: 29
NAME: IFX.GOSPEL⁷          ID: 10751652294          KILL: 4
NAME: IFX.PABLO15          ID: 2014454906           KILL: 2
```

- `TotalScore` esperado = `KillScore + RankScore`; `KillScore` esperado = suma de `KILL` de sus jugadores. Las inconsistencias generan advertencias y no abortan la app.
- El orden del archivo es por `Rank` de la partida, **no** por puntaje: nunca se asume que la posición en el archivo sea la del ranking final.
- Tolerante a BOM UTF-8/UTF-16, `\r\n`, espacios múltiples y líneas basura (se registran como advertencias).
- Nombres con Unicode: `ㅤ` (U+3164), superíndices, emojis, etc. se muestran correctamente: ver `AGENTS.md` §4 para reglas de normalización.

See `AGENTS.md` for the full specification (in Spanish).

## Modos de cálculo

| Modo                                   | Descripción                                                                              |
| -------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Score total estándar** (por defecto) | Usa el `TotalScore` del log tal cual.                                                    |
| **Posición + kills**                   | Recalcula con la tabla de posiciones (por defecto `12,9,8,7,6,5,4,3,2,1`) y `kills × 1`. |
| **Solo kills**                         | Puntúa únicamente las kills.                                                             |
| **Personalizado**                      | Tabla de posiciones y multiplicador de kills editables.                                  |

Desempates configurables (aplicados tras ordenar por total descendente): más kills → mejor rank → más booyahs.

## Limitaciones conocidas

- El fixture de tests (`tests/fixtures/MatchResult_example_log.txt`) es una reconstrucción sintética a partir de los datos verificados del spec; se reemplazará por el log real del dueño cuando esté disponible.
- En Safari la primera exportación PNG puede salir sin imágenes/fuentes: se mitiga con espera de `document.fonts.ready` + `img.decode()` + `getAnimations()`, pero puede requerir un reintento en algunos casos.

## Plantillas (sistema TEMPLATESv2 + Free Fire)

Una sola estructura (la de **Corona**) con 13 variantes: cambian colores, tipografía,
posiciones y formatos, pero todas mantienen los mismos bloques (cabecera + píldoras,
podio, lista 4+, MVP y pie). La galería tiene pestañas **Todas · General · Free Fire**.

| Plantilla                | Catálogo    | Tema   | Rasgos                                                          |
| ------------------------ | ----------- | ------ | --------------------------------------------------------------- |
| **Corona** (por defecto) | general     | oscura | esmeralda/dorado, podio escalonado, barras, anillos             |
| **Brasa**                | general     | oscura | rojo-naranja, banner, MVP arriba, diagonales, ángulos rectos    |
| **Medianoche**           | general     | oscura | azul profundo, todo centrado, MVP en franja, arcos              |
| **Marfil**               | general     | clara  | marfil + verde bosque, podio héroe, puntos guía, `1.º`          |
| **Pista**                | general     | clara  | concreto claro/naranja, cifras grandes, chips, rayas            |
| **Granate**              | general     | oscura | vino/champán, centrada, anillos finos, serif                    |
| **Cobalto**              | general     | oscura | banner amarillo, podio en fila, MVP arriba, ángulos rectos      |
| **Arena**                | general     | clara  | arena/terracota, podio héroe, chips, retícula de puntos         |
| **Hielo**                | general     | clara  | azul acero/ámbar, cuadrícula, numeración `#4`                   |
| **Ámbar**                | general     | oscura | negro/ámbar, `scan` de pantalla, cifras en mono                 |
| **Booyah**               | Free Fire   | oscura | negro cálido/naranja-ámbar, banner, podio héroe, chevrons       |
| **Zona Roja**            | Free Fire   | oscura | rojo/ámbar, podio en fila, anillos de zona, barras              |
| **Kalahari**             | Free Fire   | clara  | arena/tierra cocida/verde azulado, centrada, podio escalonado   |

En todas: par de fuentes editable (13 pares autoalojados, carga perezosa), color de
acento, color de texto, logo y fondo propio (scrim horneado con el bg de la plantilla;
las claras van con color plano + decoración si no hay fondo). Los overrides se guardan
por plantilla (`styleByTemplate`). Contraste mínimo verificado ≥ 4.5:1. Las 3 plantillas
Free Fire no usan ningún activo oficial de Garena.

**Hoja de contactos:** `npm run contact-sheet` muestra las 13 plantillas lado a lado
(local Vite page, `contact-sheet.html`).

## Despliegue (GitHub Pages y Vercel)

El mismo build funciona en ambos hosts sin tocar código: la ruta base se define solo
con la variable de entorno `VITE_BASE` (por defecto `/`) y todos los assets se resuelven
con `import.meta.env.BASE_URL`. Sin router ni rutas absolutas.

**GitHub Pages (automático):** el repo incluye `.github/workflows/deploy.yml` que, en cada
push a `main`, corre `lint`, `test` y `build` con `VITE_BASE=/<nombre-del-repo>/` y publica
`dist/`. Configura una vez: _Settings → Pages → Source: GitHub Actions_. No toques nada más.

**Vercel (plan gratuito):** importa el repo, preset **Vite** (autodetectado). Build:
`npm run build` · output: `dist/`. Deja `VITE_BASE` **sin definir** (raíz `/`). No se
necesita `vercel.json` ni funciones serverless: la app es 100 % cliente.
