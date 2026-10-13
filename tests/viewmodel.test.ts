import { describe, expect, it } from 'vitest';
import { assignCodes, baseCode } from '../src/core/viewmodel/codes';
import { truncateName } from '../src/core/viewmodel/format';
import { buildHeadline, type HeadlineFacts } from '../src/core/viewmodel/headline';
import { buildViewModel } from '../src/core/viewmodel/buildViewModel';
import { hashSeed, mulberry32, prngFor } from '../src/core/viewmodel/seed';
import { computeStandings } from '../src/core/engine/calculate';
import { parseLog } from '../src/core/parser/parseLog';
import { defaultEngineOptions } from '../src/core/engine/presets';
import { DEFAULT_SETTINGS } from '../src/storage/persist';
import fixtureText from './fixtures/MatchResult_example_log.txt?raw';
import type { EngineResult, TeamStanding } from '../src/core/types';
/// <reference types="vite/client" />

const room = parseLog(fixtureText, 'MatchResult_example_log.txt');
const result: EngineResult = computeStandings([room], defaultEngineOptions());

describe('seed (determinismo)', () => {
  it('misma entrada → mismos números', () => {
    const a = prngFor('torneo|1|2026-10-12');
    const b = prngFor('torneo|1|2026-10-12');
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('hashSeed produce u32 estable y mulberry32 elige siempre igual', () => {
    const seed = hashSeed('ABC');
    expect(hashSeed('ABC')).toBe(seed);
    const rng1 = mulberry32(seed);
    const rng2 = mulberry32(seed);
    expect(rng1()).toBe(rng2());
  });
});

describe('codes (3 letras)', () => {
  it('varias palabras → iniciales + letras de la 1.ª palabra; una palabra → primeras 3', () => {
    // §4.1: iniciales hasta 3 palabras y, si faltan, letras de la primera palabra.
    expect(baseCode('TAURUS GAMER')).toBe('TGA'); // T(aurus)+G(amer)+A(fill)
    expect(baseCode('INFERNAL FOX')).toBe('IFN');
    expect(baseCode('S7 GOLD')).toBe('SG7');
    expect(baseCode('Quimera')).toBe('QUI');
  });

  it('ignora prefijos de clan y símbolos', () => {
    // "Team" es prefijo ignorado → queda una sola palabra: APEX → APE.
    expect(baseCode('Team Apex')).toBe('APE');
    expect(baseCode('TG★bsX!')).toBe('TBG'); // TG + bsX → iniciales + fill
  });

  it('difiere posiciones: faltan letras → completa con la primera palabra', () => {
    expect(baseCode('AB DUPLICADO')).toBe('ADB'); // iniciales A,D + fill B
  });

  it('unicidad con 24 equipos que colisionan', () => {
    const many: TeamStanding[] = Array.from({ length: 24 }, (_, index) => ({
      key: `AL ${index}`,
      name: 'Alpha Beta', // mismo nombre: colisiones garantizadas
      kills: index,
      booyahs: 0,
      rankPoints: 0,
      total: 24 - index,
      roomsPlayed: 1,
      bestRank: 1,
    }));
    const codes = assignCodes(many);
    expect(new Set(codes).size).toBe(24);
    expect(codes.every((code) => /^[A-Z0-9]{3}$/.test(code))).toBe(true);
    expect(codes[0]).toBe('ABL'); // A(lpha)+B(eta)+L de Alpha
    // La primera colisión sustituye la 3.ª letra por la consonante disponible.
    expect(codes[1]).toBe('ABB'); // colisión → 1.ª consonante en la 3.ª posición
  });
});

describe('format', () => {
  it('trunca considerando grafemas compuestos', () => {
    expect(truncateName('IFX.GOSPEL⁷ SUPERNOMBRE DEMASIADO LARGO', 12)).toMatch(/…$/);
    expect(truncateName('SI CORTO', 12)).toBe('SI CORTO');
  });
});

describe('headline (solo hechos reales)', () => {
  const facts: HeadlineFacts = {
    title: 'COPA ESTELAR',
    matchday: '1',
    leader: { name: 'TAURUS GAMER', total: 32, kills: 23, booyahs: 0 },
    second: { name: 'INFERNAL FOX', total: 29 },
    mvp: { name: "TG shadw9'INF", kills: 8, teamName: 'TAURUS GAMER' },
    rooms: 1,
  };

  it('titular determinista con cifras reales', () => {
    const a = buildHeadline(facts);
    const b = buildHeadline(facts);
    expect(a.title).toBe(b.title);
    expect(a.title).toContain('TAURUS GAMER');
    expect(a.lead).toContain('32');
    expect(a.lead).toContain('8');
  });

  it('empate en la cima se anuncia como empate', () => {
    const tied = buildHeadline({ ...facts, second: { name: 'INFERNAL FOX', total: 32 } });
    expect(tied.title).toContain('EMPATE EN LA CIMA');
  });

  it('sin segundo equipo no menciona a nadie más', () => {
    const solo = buildHeadline({ ...facts, second: undefined });
    expect(solo.title).not.toContain('INFERNAL');
  });
});

describe('buildViewModel', () => {
  const vm = buildViewModel(result, [room], {
    title: DEFAULT_SETTINGS.title && 'Torneo de prueba',
    matchday: '1',
    date: '2026-10-12',
    moderator: 'Moderador',
  });

  it('filas con posición, código único y gaps correctos', () => {
    expect(vm.standings).toHaveLength(10);
    expect(vm.standings[0]).toMatchObject({ position: 1, gapToLeader: 0, shareOfLeader: 1 });
    expect(vm.standings[0]?.total).toBe(32);
    expect(vm.standings[1]?.gapToLeader).toBe(3); // 32 - 29
    const codes = vm.standings.map((row) => row.code);
    expect(new Set(codes).size).toBe(10);
  });

  it('podio = 3 primeras; resto = 7; mvp top 3 con posición', () => {
    expect(vm.podium).toHaveLength(3);
    expect(vm.rest).toHaveLength(7);
    expect(vm.mvp.map((p) => p.position)).toEqual([1, 2, 3]);
  });

  it('resumen de salas con booyah', () => {
    expect(vm.rooms[0]).toMatchObject({
      label: 'Sala 1',
      kills: 86,
      points: 143,
      booyahTeam: 'INFERNAL FOX',
    });
  });
});
