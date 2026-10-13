import type {
  EngineOptions,
  EngineResult,
  ParsedRoom,
  TeamEntry,
  TeamStanding,
  TournamentTotals,
} from '../types';
import { isSimilar, normalizeTeamKey } from '../parser/normalize';
import { computeMvp } from './mvp';
import { sortStandings } from './tiebreak';

/** Puntos de posición del rank dado según la tabla (0 si el rank excede la tabla). */
export function positionPointsFor(positionPoints: readonly number[], rank: number): number {
  return positionPoints[rank - 1] ?? 0;
}

interface Accum {
  key: string;
  name: string;
  kills: number;
  booyahs: number;
  rankPoints: number;
  total: number;
  roomsPlayed: number;
  bestRank: number;
}

interface TeamScore {
  rankPoints: number;
  killPoints: number;
  total: number;
}

/** Puntuación de un equipo en una sala según el modo de cálculo. */
export function scoreTeam(team: TeamEntry, options: EngineOptions): TeamScore {
  switch (options.mode) {
    case 'position-kills':
    case 'custom': {
      const rankPoints = positionPointsFor(options.positionPoints, team.rank);
      const killPoints = team.killScore * options.killPoints;
      return { rankPoints, killPoints, total: rankPoints + killPoints };
    }
    case 'kills-only': {
      const killPoints = team.killScore * options.killPoints;
      return { rankPoints: 0, killPoints, total: killPoints };
    }
    case 'standard': {
      // Usa el TotalScore del log tal cual (se valida Kill + Rank aparte).
      return { rankPoints: team.rankScore, killPoints: team.killScore, total: team.totalScore };
    }
  }
}

/**
 * Calcula la clasificación completa del torneo a partir de una o varias salas.
 * Función pura: no muta las salas de entrada.
 */
export function computeStandings(
  rooms: readonly ParsedRoom[],
  options: EngineOptions,
): EngineResult {
  const byKey = new Map<string, Accum>();

  for (const room of rooms) {
    for (const team of room.teams) {
      const score = scoreTeam(team, options);
      let acc = byKey.get(team.key);
      if (!acc) {
        acc = {
          key: team.key,
          name: team.name,
          kills: 0,
          booyahs: 0,
          rankPoints: 0,
          total: 0,
          roomsPlayed: 0,
          bestRank: Number.POSITIVE_INFINITY,
        };
        byKey.set(team.key, acc);
      }
      acc.kills += team.killScore;
      acc.booyahs += team.rank === 1 ? 1 : 0;
      acc.rankPoints += score.rankPoints;
      acc.total += score.total;
      acc.roomsPlayed += 1;
      acc.bestRank = Math.min(acc.bestRank, team.rank);
      // El primer nombre limpio visto gana como nombre para mostrar.
      acc.name = acc.name.length > 0 ? acc.name : team.name;
    }
  }

  const standings = sortStandings([...byKey.values()] satisfies TeamStanding[], options.tiebreak);

  const standingsWithBestRank: TeamStanding[] = standings.map((s) => ({
    key: s.key,
    name: s.name,
    kills: s.kills,
    booyahs: s.booyahs,
    rankPoints: s.rankPoints,
    total: s.total,
    roomsPlayed: s.roomsPlayed,
    bestRank: s.bestRank === Number.POSITIVE_INFINITY ? s.roomsPlayed : s.bestRank,
  }));

  return {
    standings: standingsWithBestRank,
    mvp: computeMvp(rooms, standingsWithBestRank),
    totals: computeTotals(standingsWithBestRank, rooms.length),
    similarTeams: findSimilarTeams(rooms),
  };
}

/** Longitud mínima de nombre para considerar "casi iguales" (evita falsos positivos). */
const MIN_NAME_LENGTH = 8;

function computeTotals(standings: readonly TeamStanding[], roomCount: number): TournamentTotals {
  const sum = (pick: (s: TeamStanding) => number): number =>
    standings.reduce((acc, s) => acc + pick(s), 0);
  return {
    teams: standings.length,
    rooms: roomCount,
    kills: sum((s) => s.kills),
    points: sum((s) => s.total),
    booyahs: sum((s) => s.booyahs),
  };
}

/**
 * Detecta pares de equipos distintos (claves diferentes) con nombres casi
 * iguales (distancia de edición ≤ 2): probable error tipográfico entre salas.
 * Compara claves normalizadas; devuelve nombres para mostrar.
 */
function findSimilarTeams(rooms: readonly ParsedRoom[]): string[][] {
  const namesByRoom = rooms.map((room) => {
    const names = new Map<string, string>(); // key → nombre para mostrar
    for (const team of room.teams) {
      names.set(team.key, team.name);
    }
    return names;
  });

  const pool = new Map<string, { items: Array<{ roomIndex: number; name: string }> }>();
  for (const [roomIndex, names] of namesByRoom.entries()) {
    for (const [key, name] of names.entries()) {
      const entry = pool.get(key) ?? { items: [] };
      entry.items.push({ roomIndex, name });
      pool.set(key, entry);
    }
  }

  const keys = [...pool.keys()].sort((a, b) => a.localeCompare(b));
  const similar: string[][] = [];
  for (let i = 0; i < keys.length; i++) {
    const keyA = keys[i];
    if (keyA === undefined) continue;
    for (let j = i + 1; j < keys.length; j++) {
      const keyB = keys[j];
      if (keyB === undefined) continue;
      const nameA = pool.get(keyA)?.items[0]?.name ?? '';
      const nameB = pool.get(keyB)?.items[0]?.name ?? '';
      // Nombres cortos (< 8) producen falsos positivos con distancia ≤ 2:
      // p. ej. "LY GOLD" vs "S7 GOLD" son equipos distintos legítimos.
      if (
        nameA.length >= MIN_NAME_LENGTH &&
        nameB.length >= MIN_NAME_LENGTH &&
        isSimilar(normalizeTeamKey(nameA), normalizeTeamKey(nameB))
      ) {
        similar.push([nameA, nameB]);
      }
    }
  }
  return similar;
}
