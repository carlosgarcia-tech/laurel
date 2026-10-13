// @vitest-environment jsdom
/// <reference types="vite/client" />
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { computeStandings } from '../src/core/engine/calculate';
import { parseLog } from '../src/core/parser/parseLog';
import { DEFAULT_SETTINGS } from '../src/storage/persist';
import { ResultImage } from '../src/features/preview/ResultImage';
import type { Settings } from '../src/core/types';

import fixtureText from './fixtures/MatchResult_example_log.txt?raw';
const room = parseLog(fixtureText, 'MatchResult_example_log.txt');

const settings: Settings = {
  ...DEFAULT_SETTINGS,
  title: 'Copa Estelar',
  matchday: '1',
  date: '2026-10-12',
  moderator: 'Moderador Feralç',
};

afterEach(cleanup);

describe('ResultImage (vista de exportación)', () => {
  const result = computeStandings([room], {
    mode: 'standard',
    positionPoints: DEFAULT_SETTINGS.positionPoints,
    killPoints: DEFAULT_SETTINGS.killPoints,
    tiebreak: DEFAULT_SETTINGS.tiebreak,
  });
  const { container } = render(<ResultImage result={result} settings={settings} />);
  const text = container.textContent ?? '';

  it('muestra el podio: TAURUS GAMER 1º y INFERNAL FOX 2º', () => {
    expect(text).toContain('TAURUS GAMER');
    expect(text).toContain('INFERNAL FOX');
    expect(text).toContain('32');
    expect(text).toContain('29');
  });

  it('lista posiciones 4+ con columnas KILLS/BOOY/RANK/TOTAL', () => {
    expect(text).toContain('KILLS');
    expect(text).toContain('BOOY');
    expect(text).toContain('RANK');
    expect(text).toContain('TOTAL');
    expect(text).toContain('QUIMERA PRUEBA');
  });

  it('muestra píldoras totales y MVP', () => {
    expect(text).toContain('10'); // 10 equipos
    expect(text).toContain('143'); // puntos totales
    expect(text).toContain('TG shadw9'); // MVP #1 truncado
    expect(text).toContain('IFX.astro10'); // MVP #2
  });

  it('no muestra placeholders [ ... ] en la exportación', () => {
    expect(text).not.toMatch(/\[[^\]]...\]/);
    expect(text).not.toContain('[Sin');
  });
});
