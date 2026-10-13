import type { EngineOptions, TiebreakRule } from '../types';

/** Tabla de puntos por posición por defecto (ranks 1..10). */
export const DEFAULT_POSITION_POINTS: readonly number[] = [12, 9, 8, 7, 6, 5, 4, 3, 2, 1];

/** Puntos por kill por defecto. */
export const DEFAULT_KILL_POINTS = 1;

/** Orden de desempates por defecto: más kills → mejor rank → más booyahs. */
export const DEFAULT_TIEBREAK: readonly TiebreakRule[] = ['kills', 'best-rank', 'booyahs'];

export function defaultEngineOptions(): EngineOptions {
  return {
    mode: 'standard',
    positionPoints: [...DEFAULT_POSITION_POINTS],
    killPoints: DEFAULT_KILL_POINTS,
    tiebreak: [...DEFAULT_TIEBREAK],
  };
}
