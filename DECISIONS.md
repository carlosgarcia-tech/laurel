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
- `EngineResult` (nueva): contenedor con `standings`, `mvp`, `totals` y `similarTeams` del resultado del motor.
- `TournamentTotals` (nueva): píldoras de la cabecera (`teams`, `rooms`, `kills`, `points`, `booyahs`).

### Desempate del MVP: "mejor puesto de su equipo"

Se interpretó como la **mejor posición (`Rank`) lograda por el equipo en la partida** (no su posición en la clasificación final acumulada), porque con el fixture reproduce el resultado citado en §6: IFX.astro10 (equipo rank 1) por encima de TG joãopene (equipo rank 2) empatados con 7 kills. En multi-sala se usa el `bestRank` acumulado del equipo. Desempates en orden: kills ↓ → mejor rank del equipo ↑ → orden de aparición.

### Advertencia de nombres similares: longitud mínima

`AGENTS.md` pide avisar con distancia de edición ≤ 2. Con equipos de pocos caracteres eso marca falsos positivos (`LY GOLD` vs `S7 GOLD`, ambos legítimos y distintos). Se agregó un requisito adicional: **longitud mínima de 8 caracteres** (normalizados) para emitir la advertencia. La duplicidad exacta (misma clave) sigue agrupándose y nunca se advierte.

### Nivel de advertencias a nivel de sala

`ParseWarning.line === 0` indica advertencia de consistencia que no pertenece a una línea concreta (p. ej. KillScore vs suma de jugadores, aunque hoy se apunta a la línea del equipo implicado); se mantiene el número de línea del equipo para que la UI pueda señalar el equipo.

### Motor y modos en fase 1

- `position-kills` y `custom` comparten la misma fórmula (tabla de posiciones + `kills × killPoints`); la diferencia es de UI (`custom` expondrá tabla editable), como anticipa §7.
- `kills-only` ignora la tabla de posiciones y multiplica kills por `killPoints`.
- `standard` usa el `TotalScore` del log tal cual: por eso los ranks 5/6 invertidos del log (RanksScore 5 y 6 no monótonos) quedan intactos, y es exactamente lo que valida el test de tabla §6.

### Otras decisiones del tooling

- Build: `npm run build` = `typecheck && vite build` (un solo tsconfig sin `tsc -b` compuesto; suficiente y más simple por ahora.
- `AGENTS.md` está fuera del formateo de Prettier (fuera de `.prettierrc`) vía `.prettierignore`: es el documento de especificación y no debe reescribirse automáticamente.
- `@typescript-eslint/no-unused-vars` con `argsIgnorePattern: '^_'` (convención para parámetros reservados, p. ej. en `componentDidCatch` del ErrorBoundary).
- Se evitó la regla type-aware `prefer-nullish-coalescing` porque requiere `parserOptions.project`; se reevaluará en fase 5 si se quiere puede añadirse con configs separadas para `core/`.
- Dependencias: se fijó `es-abstract@1.23.9` para resolver un bug de resolución de `array.prototype.flat@1.3.3` con `es-abstract@1.24.2` (falta `2024/ArraySpeciesCreate`) que rompía ESLint vía `jsx-a11y`.
