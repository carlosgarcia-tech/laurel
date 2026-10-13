import type { TeamStanding, TiebreakRule } from '../types';

/**
 * Ordena la clasificación: total descendente y, a igualdad, la lista de
 * desempates en orden (más kills → mejor rank → más booyahs por defecto),
 *terminando por orden alfabético para garantizar determinismo.
 * Array.prototype.sort es estable (ES2019+), lo que conserva el orden de aparición.
 */
export function sortStandings(
  standings: readonly TeamStanding[],
  tiebreak: readonly TiebreakRule[],
): TeamStanding[] {
  return [...standings].sort((a, b) => {
    if (a.total !== b.total) return b.total - a.total;
    for (const rule of tiebreak) {
      switch (rule) {
        case 'kills':
          if (a.kills !== b.kills) return b.kills - a.kills;
          break;
        case 'best-rank':
          if (a.bestRank !== b.bestRank) return a.bestRank - b.bestRank;
          break;
        case 'booyahs':
          if (a.booyahs !== b.booyahs) return b.booyahs - a.booyahs;
          break;
      }
    }
    return a.name.localeCompare(b.name, 'es');
  });
}
