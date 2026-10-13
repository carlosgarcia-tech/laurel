// @vitest-environment jsdom
/// <reference types="vite/client" />
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { computeStandings } from '../src/core/engine/calculate';
import { defaultEngineOptions } from '../src/core/engine/presets';
import { parseLog } from '../src/core/parser/parseLog';
import { buildViewModel } from '../src/core/viewmodel/buildViewModel';
import { ResultImage } from '../src/features/templates/ResultImage';
import { TEMPLATES, densityFor, getTemplate } from '../src/features/templates/templates';
import { readableOn, mix } from '../src/features/templates/tokens';
import { FONT_PAIRS, FONT_PAIR_IDS } from '../src/features/templates/fonts';
import type { TemplateConfig } from '../src/features/templates/types';
import fixtureText from './fixtures/MatchResult_example_log.txt?raw';

afterEach(cleanup);

const room = parseLog(fixtureText, 'MatchResult_example_log.txt');
const rooms = [room];
const engineResult = computeStandings(rooms, defaultEngineOptions());
const vm = buildViewModel(engineResult, rooms, {
  title: 'COPA ESTELAR',
  matchday: '1',
  date: '2026-10-12',
  moderator: 'Moderador Final',
});
function renderTemplate(config: TemplateConfig, format: '4:5' | '9:16' | '1:1' = '4:5'): string {
  const heights = { '4:5': 1350, '9:16': 1920, '1:1': 1080 };
  const { container } = render(
    <ResultImage
      vm={vm}
      config={config}
      style={{}}
      assets={{}}
      format={format}
      width={1080}
      height={heights[format]}
    />,
  );
  return container.textContent ?? '';
}

describe('Catálogo (TEMPLATESv2 §5)', () => {
  it('hay exactamente 10 plantillas con ids únicos', () => {
    expect(TEMPLATES).toHaveLength(10);
    expect(new Set(TEMPLATES.map((t) => t.id)).size).toBe(10);
  });

  it('la tabla 5.1 va copiada tal cual', () => {
    const expected: Array<[string, string, string]> = [
      ['corona', 'left', 'rings'],
      ['brasa', 'banner', 'slashes'],
      ['medianoche', 'center', 'arcs'],
      ['marfil', 'left', 'brackets'],
      ['pista', 'split', 'stripes'],
      ['granate', 'center', 'rings'],
      ['cobalto', 'banner', 'slashes'],
      ['selva', 'left', 'dots'],
      ['hielo', 'split', 'grid'],
      ['ambar', 'banner', 'scan'],
    ];
    for (const [id, header, decor] of expected) {
      const template = getTemplate(id);
      expect(template.header).toBe(header);
      expect(template.decor).toBe(decor);
    }
    expect(getTemplate('marfil').theme).toBe('light');
    expect(getTemplate('hielo').theme).toBe('light');
    expect(getTemplate('brasa').mvpPlacement).toBe('before-list');
    expect(getTemplate('corona').numerals).toBe('pad');
    expect(getTemplate('marfil').list).toBe('dots');
    expect(getTemplate('pista').podium).toBe('row');
  });

  it('cada plantilla cambia ≥ 3 opciones de §1.2 respecto a Corona', () => {
    const corona = getTemplate('corona');
    for (const template of TEMPLATES) {
      if (template.id === 'corona') continue;
      const diffs = [
        template.header !== corona.header,
        template.podium !== corona.podium,
        template.list !== corona.list,
        template.mvp !== corona.mvp,
        template.mvpPlacement !== corona.mvpPlacement,
        template.decor !== corona.decor,
        template.radius !== corona.radius,
        template.numerals !== corona.numerals,
        template.fontPairId !== corona.fontPairId,
        template.theme !== corona.theme,
      ].filter(Boolean).length;
      expect(template.id).toBeDefined();
      expect(diffs).toBeGreaterThanOrEqual(3);
    }
  });

  it('los pares de fuentes cubren p1…p10 sin duplicados', () => {
    expect(FONT_PAIRS.map((p) => p.id)).toEqual([
      'p1',
      'p2',
      'p3',
      'p4',
      'p5',
      'p6',
      'p7',
      'p8',
      'p9',
      'p10',
    ]);
    for (const template of TEMPLATES) {
      expect(FONT_PAIR_IDS.has(template.fontPairId)).toBe(true);
    }
  });
});

describe('Tokens derivados (§5.2)', () => {
  it('mix interpola en sRGB', () => {
    expect(mix('#000000', '#ffffff', 0.5)).toBe('#808080');
    expect(mix('#0e1a17', '#0e1a17', 0.7)).toBe('#0e1a17');
  });

  it('readableOn da negro si el acento es claro y blanco si es oscuro', () => {
    expect(readableOn('#34d399')).toBe('#0a0a0a'); // esmeralda clara → texto oscuro
    expect(readableOn('#0f7a55')).toBe('#ffffff'); // verde bosque → texto claro
  });
});

describe('Densidad y bloqueo de listas (§3)', () => {
  it('comfortable ≤ 10, compact 11–16, multi > 16', () => {
    expect(densityFor(10)).toBe('comfortable');
    expect(densityFor(11)).toBe('compact');
    expect(densityFor(16)).toBe('compact');
    expect(densityFor(17)).toBe('multi');
  });
});

describe('Render de las 10 plantillas con el fixture real', () => {
  for (const template of TEMPLATES) {
    it(`${template.name} muestra podio, lista, MVP y pie`, () => {
      const text = renderTemplate(template);
      expect(text).toContain('TAURUS GAMER'); // podio/1.º
      expect(text).toContain('APEX'); // última posición
      expect(text).toContain('MVP'); // bloque o etiqueta MVP
      expect(text).toContain('MODERADOR'); // pie
      expect(text).toContain('143'); // puntos totales en píldoras
    });
  }

  it('todas las plantillas renderizan también en 9:16 y 1:1', () => {
    for (const template of TEMPLATES) {
      expect(renderTemplate(template, '9:16').length).toBeGreaterThan(0);
      expect(renderTemplate(template, '1:1').length).toBeGreaterThan(0);
    }
  });

  it('menos de 3 equipos: el podio se adapta sin crash', () => {
    const shortVm = { ...vm, podium: vm.standings.slice(0, 1), rest: vm.standings.slice(1) };
    const { container } = render(
      <ResultImage
        vm={shortVm}
        config={getTemplate('corona')}
        style={{}}
        assets={{}}
        format="4:5"
        width={1080}
        height={1350}
      />,
    );
    expect(container.textContent).toContain('TAURUS GAMER');
  });
});

describe('ViewModel base (regresión de la tabla del spec)', () => {
  it('posiciones y totales exactos', () => {
    expect(vm.standings[0]).toMatchObject({ position: 1, total: 32 });
    expect(vm.standings[1]).toMatchObject({ position: 2, total: 29, gapToLeader: 3 });
    expect(vm.standings[7]?.total).toBe(6); // UZX
  });
});
