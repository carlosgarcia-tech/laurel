import { describe, expect, it } from 'vitest';
import { computeStandings, positionPointsFor, scoreTeam } from '../src/core/engine/calculate';
import { defaultEngineOptions } from '../src/core/engine/presets';
import { sortStandings } from '../src/core/engine/tiebreak';
import { parseLog } from '../src/core/parser/parseLog';
import { isSimilar } from '../src/core/parser/normalize';
import type { ParsedRoom, TeamEntry, TeamStanding } from '../src/core/types';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const fixtureUrl = new URL('./fixtures/MatchResult_example_log.txt', import.meta.url);
const room = parseLog(
  readFileSync(fileURLToPath(fixtureUrl), 'utf8'),
  'MatchResult_example_log.txt',
);

/** Tabla exacta de la sección 6 de AGENTS.md. */
const EXPECTED_TABLE = [
  { name: 'TAURUS GAMER', kills: 23, booyahs: 0, rankPoints: 9, total: 32 },
  { name: 'INFERNAL FOX', kills: 17, booyahs: 1, rankPoints: 12, total: 29 },
  { name: 'TYPHON GAMING', kills: 8, booyahs: 0, rankPoints: 8, total: 16 },
  { name: 'LY GOLD', kills: 8, booyahs: 0, rankPoints: 7, total: 15 },
  { name: 'S7 GOLD', kills: 9, booyahs: 0, rankPoints: 5, total: 14 },
  { name: 'FLAMITA ESPORT', kills: 7, booyahs: 0, rankPoints: 6, total: 13 },
  { name: 'QUIMERA PRUEBA', kills: 6, booyahs: 0, rankPoints: 4, total: 10 },
  { name: 'UZX GOLD', kills: 4, booyahs: 0, rankPoints: 2, total: 6 },
  { name: 'GCL FFWS', kills: 3, booyahs: 0, rankPoints: 3, total: 6 },
  { name: 'APEX LEGACY', kills: 1, booyahs: 0, rankPoints: 1, total: 2 },
] as const;

describe('engine — modo estándar (tabla de la sección 6)', () => {
  const result = computeStandings([room], defaultEngineOptions());

  it('reproduce la tabla exacta', () => {
    expect(result.standings).toHaveLength(10);
    EXPECTED_TABLE.forEach((expected, index) => {
      const row = result.standings[index];
      expect(row?.name).toBe(expected.name);
      expect(row?.kills).toBe(expected.kills);
      expect(row?.booyahs).toBe(expected.booyahs);
      expect(row?.rankPoints).toBe(expected.rankPoints);
      expect(row?.total).toBe(expected.total);
      expect(row?.roomsPlayed).toBe(1);
    });
  });

  it('totales: 10 equipos, 1 sala, 86 kills, 143 puntos, 1 booyah', () => {
    expect(result.totals).toEqual({ teams: 10, rooms: 1, kills: 86, points: 143, booyahs: 1 });
  });

  it('UZX GOLD (4 kills) queda sobre GCL FFWS (3 kills) con desempate por kills', () => {
    expect(result.standings[7]?.key).toBe('UZX GOLD');
    expect(result.standings[8]?.key).toBe('GCL FFWS');
  });

  it('el log NO está ordenado por TotalScore: INFERNAL (rank 1) no va primero', () => {
    expect(result.standings[0]?.name).toBe('TAURUS GAMER');
    expect(result.standings[1]?.name).toBe('INFERNAL FOX');
  });

  it('sin equipos casi iguales en una sala', () => {
    expect(result.similarTeams).toEqual([]);
  });
});

describe('engine — MVP (top 3 por kills, agrupado por ID)', () => {
  const result = computeStandings([room], defaultEngineOptions());

  it('devuelve los 3 expected: shadw9 8, astro10 y joãopene con 7', () => {
    expect(result.mvp).toHaveLength(3);
    expect(result.mvp[0]).toMatchObject({
      name: "TG shadw9'INF",
      kills: 8,
      teamName: 'TAURUS GAMER',
    });
    // Empate a 7: gana el jugador cuyo equipo logró mejor rank (INFERNAL FOX, rank 1).
    expect(result.mvp[1]).toMatchObject({ name: 'IFX.astro10', kills: 7 });
    expect(result.mvp[2]).toMatchObject({ name: 'TG joãopene', kills: 7 });
  });
});

describe('engine — modos alternativos', () => {
  it('position-kills recalcula los rankScore con la tabla por defecto', () => {
    const options = { ...defaultEngineOptions(), mode: 'position-kills' as const };
    const result = computeStandings([room], options);
    // Los ranks 5/6 del log NO son monótonos (RankScore 5 y 6 invertidos):
    // position-kills sí aplica la tabla [12,9,8,7,6,5,4,3,2,1] y reordena.
    const s7 = result.standings.find((s) => s.key === 'S7 GOLD');
    const flamita = result.standings.find((s) => s.key === 'FLAMITA ESPORT');
    expect(s7?.total).toBe(6 + 9); // rank 5 → 6 pts + 9 kills
    expect(flamita?.total).toBe(5 + 7); // rank 6 → 5 pts + 7 kills
    expect(result.standings[0]).toMatchObject({ key: 'TAURUS GAMER', total: 32 });
  });

  it('kills-only ordena por kills y desempata mejor rank', () => {
    const options = { ...defaultEngineOptions(), mode: 'kills-only' as const };
    const result = computeStandings([room], options);
    const names = result.standings.map((s) => s.name);
    expect(names.slice(0, 3)).toEqual(['TAURUS GAMER', 'INFERNAL FOX', 'S7 GOLD']);
    // TYPHON y LY empataban con 8: mejor rank desempata (3 antes que 4).
    expect(names.slice(3, 5)).toEqual(['TYPHON GAMING', 'LY GOLD']);
    expect(result.totals.points).toBe(86);
  });

  it('custom con killPoints = 2 recalcula los totales', () => {
    const options = { ...defaultEngineOptions(), mode: 'custom' as const, killPoints: 2 };
    const result = computeStandings([room], options);
    const taurus = result.standings.find((s) => s.key === 'TAURUS GAMER');
    const inf = result.standings.find((s) => s.key === 'INFERNAL FOX');
    expect(taurus?.total).toBe(9 + 23 * 2);
    expect(inf?.total).toBe(12 + 17 * 2);
    expect(result.standings[0]?.key).toBe('TAURUS GAMER');
  });
});

describe('engine — acumulación multi-sala', () => {
  const room2: ParsedRoom = {
    fileName: 'sala-2.txt',
    teams: [
      makeTeam('TAURUS GAMER', 1, 10, 12, 22, [["TG shadw9'INF", '483726153', 3]]),
      makeTeam('INFERNAL FOX', 2, 5, 9, 14, [['IFX.astro10', '656165934', 2]]),
    ],
    warnings: [],
  };

  it('suma kills, booyahs, rankPoints, total y salas jugadas por clave', () => {
    const result = computeStandings([room, room2], defaultEngineOptions());
    expect(result.totals).toEqual({ teams: 10, rooms: 2, kills: 101, points: 179, booyahs: 2 });
    expect(result.standings[0]).toMatchObject({
      key: 'TAURUS GAMER',
      total: 54,
      roomsPlayed: 2,
      booyahs: 1,
    });
    expect(result.standings[1]).toMatchObject({ key: 'INFERNAL FOX', total: 43 });
  });

  it('MVP acumula por ID a través de las salas', () => {
    const result = computeStandings([room, room2], defaultEngineOptions());
    expect(result.mvp[0]).toMatchObject({ id: '483726153', kills: 11 }); // 8 + 3
    expect(result.mvp[1]).toMatchObject({ id: '656165934', kills: 9 }); // 7 + 2
  });

  it('avisa por equipos con nombres casi iguales entre salas', () => {
    const almost: ParsedRoom = {
      fileName: 'sala-3.txt',
      teams: [makeTeam('TAURUS GAMERS', 1, 0, 12, 12, [])],
      warnings: [],
    };
    const result = computeStandings([room, almost], defaultEngineOptions());
    expect(result.similarTeams).toContainEqual(['TAURUS GAMER', 'TAURUS GAMERS']);
  });
});

describe('sortStandings — desempates configurables', () => {
  it('desempate por booyahs', () => {
    const a = standing({ key: 'A', total: 10, booyahs: 0, kills: 5, bestRank: 1 });
    const b = standing({ key: 'B', total: 10, booyahs: 1, kills: 5, bestRank: 2 });
    const sorted = sortStandings([a, b], ['booyahs']);
    expect(sorted[0]?.key).toBe('B');
  });

  it('desempate por kills y luego alfabético como determinismo final', () => {
    const a = standing({ key: 'AA', total: 10, booyahs: 0, kills: 2, bestRank: 1 });
    const b = standing({ key: 'AB', total: 10, booyahs: 0, kills: 3, bestRank: 5 });
    const sorted = sortStandings([a, b], ['kills']);
    expect(sorted[0]?.key).toBe('AB');
  });

  it('empate total con sin desempates: orden determinista (alfabético)', () => {
    const a = standing({ key: 'AA', total: 5, booyahs: 0, kills: 1, bestRank: 1 });
    const b = standing({ key: 'AB', total: 5, booyahs: 0, kills: 1, bestRank: 2 });
    const sorted = sortStandings([b, a], []);
    expect(sorted[0]?.key).toBe('AA');
    expect(sorted[1]?.key).toBe('AB');
  });
});

describe('scoreTeam / positionPointsFor', () => {
  it('positionPointsFor devuelve 0 para ranks fuera de la tabla', () => {
    expect(positionPointsFor([12, 9], 1)).toBe(12);
    expect(positionPointsFor([12, 9], 3)).toBe(0);
    expect(positionPointsFor([], 1)).toBe(0);
  });

  it('scoreTeam: standard respeta el TotalScore del log', () => {
    const team = makeTeam('X', 4, 8, 7, 15, []);
    expect(scoreTeam(team, defaultEngineOptions())).toEqual({
      rankPoints: 7,
      killPoints: 8,
      total: 15,
    });
  });

  it('scoreTeam: position-kills recalculla rankScore con la tabla editable', () => {
    const team = makeTeam('X', 2, 8, 0, 0, []);
    const options = { ...defaultEngineOptions(), mode: 'position-kills' as const };
    expect(scoreTeam(team, options)).toEqual({ rankPoints: 9, killPoints: 8, total: 17 });
  });

  it('isSimilar con distancia acotada', () => {
    expect(isSimilar('TAURUS GAMER', 'TAURUS GAMERS')).toBe(true);
    expect(isSimilar('TAURUS GAMER', 'TAURUS GAMING')).toBe(false);
    expect(isSimilar('LY GOLD', 'LY GOLD')).toBe(false); // claves idénticas: mismo equipo
  });
});

function makeTeam(
  name: string,
  rank: number,
  killScore: number,
  rankScore: number,
  totalScore: number,
  players: Array<[string, string, number]>,
): TeamEntry {
  return {
    name,
    key: name.toUpperCase(),
    rank,
    killScore,
    rankScore,
    totalScore,
    players: players.map(([pName, id, kills]) => ({ name: pName, id, kills })),
  };
}

function standing(overrides: {
  key: string;
  total: number;
  booyahs: number;
  kills: number;
  bestRank: number;
}): TeamStanding {
  return {
    key: overrides.key,
    name: overrides.key,
    kills: overrides.kills,
    booyahs: overrides.booyahs,
    rankPoints: overrides.kills,
    total: overrides.total,
    roomsPlayed: 1,
    bestRank: overrides.bestRank,
  };
}
