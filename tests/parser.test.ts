import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parseLog } from '../src/core/parser/parseLog';
import { cleanDisplayName, normalizeTeamKey } from '../src/core/parser/normalize';
import { checkResultFile, formatBytes } from '../src/core/validation';

const fixtureUrl = new URL('./fixtures/MatchResult_example_log.txt', import.meta.url);
const FIXTURE_RAW = readFileSync(fileURLToPath(fixtureUrl), 'utf8');

describe('parseLog — fixture completo', () => {
  const room = parseLog(FIXTURE_RAW, 'MatchResult_example_log.txt');

  it('parsea las 10 salas/equipos con sus 40 jugadores', () => {
    expect(room.teams).toHaveLength(10);
    expect(room.teams.every((t) => t.players.length === 4)).toBe(true);
  });

  it('no emite advertencias para un log bien formado', () => {
    expect(room.warnings).toEqual([]);
  });

  it('lee campos numéricos del equipo', () => {
    const first = room.teams[0];
    expect(first?.name).toBe('INFERNAL FOX');
    expect(first?.rank).toBe(1);
    expect(first?.killScore).toBe(17);
    expect(first?.rankScore).toBe(12);
    expect(first?.totalScore).toBe(29);
  });

  it('cada jugador pertenece al último equipo leído', () => {
    const inf = room.teams[0];
    expect(inf?.players.map((p) => p.name)).toEqual([
      'IFX.GOSPEL⁷',
      'IFX.PABLO15',
      'IFX.Xndrez²⁶',
      'IFX.astro10',
    ]);
    expect(inf?.players[3]?.kills).toBe(7);
  });

  it('valida TotalScore = KillScore + RankScore (sección 4, hecho verificado)', () => {
    expect(room.teams.every((t) => t.totalScore === t.killScore + t.rankScore)).toBe(true);
  });

  it('valida KillScore = suma de kills de los jugadores', () => {
    for (const team of room.teams) {
      const kills = team.players.reduce((a, p) => a + p.kills, 0);
      expect(kills).toBe(team.killScore);
    }
  });

  it('asigna posición por Rank aunque el archivo no esté ordenado por puntos', () => {
    // TAURUS (rank 2, 32 pts) supera a INFERNAL FOX (rank 1, 29 pts).
    const taurus = room.teams.find((t) => t.name === 'TAURUS GAMER');
    expect(taurus?.rank).toBe(2);
    expect(taurus?.totalScore).toBeGreaterThan(room.teams[0]?.totalScore ?? 0);
  });
});

describe('parseLog — tolerancia y casos límite', () => {
  it('tolera BOM UTF-8, espacios múltiples y salto CRLF', () => {
    const crlf = '\uFEFF' + FIXTURE_RAW.replace('\n', '\r\n');
    const room = parseLog(crlf, 'x_log.txt');
    expect(room.teams).toHaveLength(10);
    expect(room.warnings).toEqual([]);
  });

  it('toma todos los saltos de línea como CRLF', () => {
    const room = parseLog(FIXTURE_RAW.split('\n').join('\r\n'), 'x_log.txt');
    expect(room.teams).toHaveLength(10);
    expect(room.warnings).toEqual([]);
  });

  it('avisa (sin crash) por líneas basura con número de línea', () => {
    const text = 'GARBAGE LINE\n' + FIXTURE_RAW;
    const room = parseLog(text, 'x.txt');
    expect(room.warnings[0]).toMatchObject({ line: 1 });
    expect(room.teams).toHaveLength(10);
  });

  it('avisa por jugador antes de cualquier equipo y lo ignora', () => {
    const text = 'NAME: YUser ID: 42 KILL: 3\n' + FIXTURE_RAW;
    const room = parseLog(text, 'x.txt');
    expect(room.warnings[0]).toMatchObject({
      line: 1,
      message: expect.stringContaining('Jugador'),
    });
    expect(room.teams).toHaveLength(10);
    expect(room.teams.every((t) => t.players.length === 4)).toBe(true);
  });

  it('avisa por TotalScore inconsistente y continúa', () => {
    const text =
      'TeamName: A Test Only Rank: 1 KillScore: 5 RankScore: 5 TotalScore: 99\n' +
      'NAME: At PlayerA ID: 1 KILL: 2\n' +
      'NAME: At PlayerB ID: 2 KILL: 3\n';
    const room = parseLog(text, 'x.txt');
    expect(room.warnings.some((w) => w.message.includes('TotalScore'))).toBe(true);
    expect(room.teams[0]?.totalScore).toBe(99);
  });

  it('avisa por KillScore inconsistente con la suma de kills de los jugadores', () => {
    const text =
      'TeamName: B Test Only Rank: 1 KillScore: 9 RankScore: 5 TotalScore: 14\n' +
      'NAME: Bt PlayerA ID: 1 KILL: 2\n' +
      'NAME: Bt PlayerB ID: 2 KILL: 3\n';
    const room = parseLog(text, 'x.txt');
    expect(room.warnings.some((w) => w.message.includes('suma de kills'))).toBe(true);
  });

  it('avisa por equipo sin jugadores', () => {
    const text = 'TeamName: C Test Only Rank: 1 KillScore: 0 RankScore: 5 TotalScore: 5\n';
    const room = parseLog(text, 'x.txt');
    expect(room.warnings[0]).toMatchObject({
      line: 1,
      message: expect.stringContaining('jugadores'),
    });
  });

  it('archivo vacío: sin equipos, sin warning, sin crash', () => {
    const room = parseLog('', 'empty.txt');
    expect(room.teams).toEqual([]);
    expect(room.warnings).toEqual([]);
  });
});

describe('normalize', () => {
  it('U+3164 se muestra como espacio normal y con trim', () => {
    expect(cleanDisplayName('TGㅤcambazn')).toBe('TG cambazn');
    expect(cleanDisplayName('  TG\u3164  banana  ')).toBe('TG banana');
  });

  it('el nombre para mostrar NO aplica NFKC (conserva superíndices)', () => {
    expect(cleanDisplayName('IFX.GOSPEL⁷')).toBe('IFX.GOSPEL⁷');
  });

  it('la clave de agrupación sí aplica NFKC + mayúsculas y colapsa espacios', () => {
    expect(normalizeTeamKey('  tg\u3164  Cambazn ')).toBe('TG CAMBAZN');
  });

  it('dos nombres casi iguales: distancia ≤ 2', () => {
    expect(cleanDisplayName('TAURUS GAMER')).not.toBe('');
    expect(cleanDisplayName('TGㅤcambazn').replace(/\u00a0/g, ' ')).toBe('TG cambazn');
  });
});

describe('isSimilar / validación de archivos', () => {
  it('acepta .txt, .log y .log.txt; rechaza otros', () => {
    expect(checkResultFile('MatchResult_1_log.txt', 100)).toMatchObject({ ok: true });
    expect(checkResultFile('match.log', 100)).toMatchObject({ ok: true });
    expect(checkResultFile('match.log.txt', 100)).toMatchObject({ ok: true });
    expect(checkResultFile('results.pdf', 100).ok).toBe(false);
  });

  it('rechaza archivos de más de 5 MB', () => {
    const tooBig = 5 * 1024 * 1024 + 1;
    expect(checkResultFile('match.txt', tooBig).ok).toBe(false);
  });

  it('formatBytes muestra tamaños legibles', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(3 * 1024 * 1024)).toBe('3.0 MB');
  });
});
