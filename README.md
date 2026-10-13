# Laurel · Resultados de torneos

Generador de imágenes de resultados de torneos: carga los logs de tus partidas (`.txt` / `.log`), configura los datos del torneo y exporta una imagen PNG lista para compartir.

**100 % client-side y estático:** todo se procesa en el navegador, sin backend ni llamadas de red con datos del usuario. Desplegable gratis en GitHub Pages y Vercel.

## Estado

- ✅ **Fase 1 — Núcleo:** parser del formato de resultados y motor de cálculo (estándar, posición+kills, solo kills, personalizado), desempates configurables, MVP, booyahs y acumulación multi-sala. Cubierto con 41 tests.
- 🔜 Fase 2 — Editor y vista previa en vivo.
- 🔜 Fase 3 — Estilo personalizable y exportación PNG.
- 🔜 Fase 4 — Persistencia, plantillas y extra de robustez.
- 🔜 Fase 5 — Accesibilidad final, Lighthouse y despliegue.

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
- En Safari la primera exportación PNG puede salir sin imágenes/fuentes: se mitigará en fase 3 con una exportación de calentamiento (se documentará aquí).
- La interfaz del editor llega en la fase 2; por ahora la app muestra un placeholder informativo.

## Plantillas (sistema TEMPLATESv2)

Una sola estructura (la de **Corona**) con 10 variantes: cambian colores, tipografía,
posiciones y formatos, pero todas mantienen los mismos bloques (cabecera + píldoras,
podio, lista 4+, MVP y pie).

| Plantilla                | Tema   | Rasgos                                                       |
| ------------------------ | ------ | ------------------------------------------------------------ |
| **Corona** (por defecto) | oscura | esmeralda/dorado, podio escalonado, barras, anillos          |
| **Brasa**                | oscura | rojo-naranja, banner, MVP arriba, diagonales, ángulos rectos |
| **Medianoche**           | oscura | azul profundo, todo centrado, MVP en franja, arcos           |
| **Marfil**               | clara  | marfil + verde bosque, podio héroe, puntos guía, `1.º`       |
| **Pista**                | oscura | grafito/naranja, cifras grandes, chips de posición, rayas    |
| **Granate**              | oscura | vino/champán, centrada, anillos finos, serif                 |
| **Cobalto**              | oscura | banner amarillo, podio en fila, MVP arriba, ángulos rectos   |
| **Selva**                | oscura | verdes/cobre, podio héroe, chips, retícula de puntos         |
| **Hielo**                | clara  | azul acero/ámbar, cuadrícula, numeración `#4`                |
| **Ámbar**                | oscura | negro/ámbar, `scan` de pantalla, cifras en mono              |

En todas: par de fuentes editable (10 pares autoalojados, carga perezosa), color de
acento, color de texto, logo y fondo propio (scrim horneado según el tema). Los overrides
se guardan por plantilla (`styleByTemplate`). Contraste mínimo verificado ≥ 4.5:1.

**Hoja de contactos:** `npm run contact-sheet` muestra las 10 plantillas lado a lado
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
