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
