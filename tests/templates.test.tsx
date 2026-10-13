// @vitest-environment jsdom
/// <reference types="vite/client" />
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { computeStandings } from '../src/core/engine/calculate';
import { defaultEngineOptions } from '../src/core/engine/presets';
import { parseLog } from '../src/core/parser/parseLog';
import { buildViewModel } from '../src/core/viewmodel/buildViewModel';
import { ResultImage } from '../src/features/templates/ResultImage';
import {
  TEMPLATES,
  densityFor,
  getTemplate,
  migrateTemplateId,
} from '../src/features/templates/templates';
import { readableOn, mix } from '../src/features/templates/tokens';
import { contrastRatio } from '../src/utils/color';
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

describe('Catálogo (TEMPLATESv2 §5 + FF §3)', () => {
  it('hay exactamente 13 plantillas con ids únicos', () => {
    expect(TEMPLATES).toHaveLength(13);
    expect(new Set(TEMPLATES.map((t) => t.id)).size).toBe(13);
  });

  it('la tabla 5.1 + 3.1 van copiadas tal cual', () => {
    const expected: Array<[string, string, string]> = [
      ['corona', 'left', 'rings'],
      ['brasa', 'banner', 'slashes'],
      ['medianoche', 'center', 'arcs'],
      ['marfil', 'left', 'brackets'],
      ['pista', 'split', 'stripes'],
      ['granate', 'center', 'rings'],
      ['cobalto', 'banner', 'slashes'],
      ['arena', 'left', 'dots'],
      ['hielo', 'split', 'grid'],
      ['ambar', 'banner', 'scan'],
      ['booyah', 'banner', 'chevrons'],
      ['zona-roja', 'split', 'zone'],
      ['kalahari', 'center', 'slashes'],
    ];
    for (const [id, header, decor] of expected) {
      const template = getTemplate(id);
      expect(template.header).toBe(header);
      expect(template.decor).toBe(decor);
    }
    expect(getTemplate('marfil').theme).toBe('light');
    expect(getTemplate('hielo').theme).toBe('light');
    expect(getTemplate('arena').theme).toBe('light');
    expect(getTemplate('pista').theme).toBe('light');
    expect(getTemplate('kalahari').theme).toBe('light');
    expect(getTemplate('brasa').mvpPlacement).toBe('before-list');
    expect(getTemplate('booyah').mvpPlacement).toBe('before-list');
    expect(getTemplate('corona').numerals).toBe('pad');
    expect(getTemplate('marfil').list).toBe('dots');
    expect(getTemplate('pista').podium).toBe('row');
    // Configuración exacta FF §3.1.
    const booyah = getTemplate('booyah');
    expect(booyah).toMatchObject({
      podium: 'hero',
      list: 'chips',
      mvp: 'strip',
      radius: 0,
      numerals: 'pad',
      fontPairId: 'p11',
    });
    const zona = getTemplate('zona-roja');
    expect(zona).toMatchObject({
      podium: 'row',
      list: 'bars',
      mvp: 'cards',
      radius: 4,
      numerals: 'plain',
      fontPairId: 'p12',
    });
    const kalahari = getTemplate('kalahari');
    expect(kalahari).toMatchObject({
      podium: 'stepped',
      list: 'dots',
      mvp: 'cards',
      radius: 8,
      numerals: 'ordinal',
      fontPairId: 'p13',
    });
  });

  it('los tokens FF coinciden con la tabla 3.2', () => {
    expect(getTemplate('booyah').tokens).toEqual({
      bg: '#0d0a06',
      surface: '#17110a',
      border: '#3b2a14',
      text: '#f6efe2',
      muted: '#b09a7d',
      accent: '#ff8a00',
      accent2: '#ffd23a',
    });
    expect(getTemplate('zona-roja').tokens).toEqual({
      bg: '#0a0e12',
      surface: '#121a21',
      border: '#263541',
      text: '#eef2f4',
      muted: '#8c9eab',
      accent: '#ff3b30',
      accent2: '#ffb020',
    });
    expect(getTemplate('kalahari').tokens).toEqual({
      bg: '#efe3c9',
      surface: '#f8f0dc',
      border: '#d2bf98',
      text: '#2a1a0e',
      muted: '#6d5a43',
      accent: '#c2410c',
      accent2: '#1f6f6b',
    });
  });

  it('el category reparte 10 general y 3 free-fire', () => {
    expect(TEMPLATES.filter((t) => t.category === 'general')).toHaveLength(10);
    expect(TEMPLATES.filter((t) => t.category === 'free-fire').map((t) => t.id)).toEqual([
      'booyah',
      'zona-roja',
      'kalahari',
    ]);
  });

  it('hay 5 plantillas claras y 8 oscuras (P1.2 + FF)', () => {
    const light = TEMPLATES.filter((t) => t.theme === 'light').map((t) => t.id);
    expect(light.sort()).toEqual(['arena', 'hielo', 'kalahari', 'marfil', 'pista']);
    expect(TEMPLATES.filter((t) => t.theme === 'dark')).toHaveLength(8);
  });

  it('el id antiguo «selva» migra a «arena»', () => {
    expect(migrateTemplateId('selva')).toBe('arena');
    expect(migrateTemplateId('corona')).toBe('corona');
    expect(TEMPLATES.some((t) => t.id === 'selva')).toBe(false);
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

  it('los pares de fuentes cubren p1…p13 sin duplicados', () => {
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
      'p11',
      'p12',
      'p13',
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

  it('arena y pista (P1.2) tienen texto y chips legibles', () => {
    for (const id of ['arena', 'pista'] as const) {
      const { tokens } = getTemplate(id);
      // Texto principal ≥ 4.5:1 sobre el fondo.
      expect(contrastRatio(tokens.text, tokens.bg) ?? 0).toBeGreaterThanOrEqual(4.5);
      // Texto sobre chips/barras del acento ≥ 4.5:1 (readableOn elige negro/blanco).
      expect(contrastRatio(readableOn(tokens.accent), tokens.accent) ?? 0).toBeGreaterThanOrEqual(
        4.5,
      );
    }
    // Naranja de Pista → texto oscuro sobre los chips.
    expect(readableOn(getTemplate('pista').tokens.accent)).toBe('#0a0a0a');
  });

  it('las 3 plantillas FF tienen contraste ≥ 4.5:1 (FF §9)', () => {
    for (const id of ['booyah', 'zona-roja', 'kalahari'] as const) {
      const { tokens } = getTemplate(id);
      expect(contrastRatio(tokens.text, tokens.bg) ?? 0).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(readableOn(tokens.accent), tokens.accent) ?? 0).toBeGreaterThanOrEqual(
        4.5,
      );
      expect(contrastRatio(tokens.muted, tokens.bg) ?? 0).toBeGreaterThanOrEqual(3);
    }
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

describe('Render de las 13 plantillas con el fixture real', () => {
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

  it('el sello BOOYAH ×N solo aparece en Booyah y con booyahs reales (FF §0/§3.3)', () => {
    // El sello es "Booyah ×N" SIN espacio (el pie usa "Booyah × N" con espacio).
    const sealPattern = /Booyah ×\d/;
    // El 1.º del fixture (TAURUS, 32 pts) no tiene booyahs → sin sello.
    expect(renderTemplate(getTemplate('booyah'))).not.toMatch(sealPattern);
    // Con un líder que sí tiene booyahs → sello en Booyah…
    const leaderBooyahVm = {
      ...vm,
      podium: vm.podium.map((row, i) => (i === 0 ? { ...row, booyahs: 2 } : row)),
    };
    const renderBooyah = (config: TemplateConfig): string => {
      const { container } = render(
        <ResultImage
          vm={leaderBooyahVm}
          config={config}
          style={{}}
          assets={{}}
          format="4:5"
          width={1080}
          height={1350}
        />,
      );
      return container.textContent ?? '';
    };
    expect(renderBooyah(getTemplate('booyah'))).toMatch(sealPattern);
    // …y nunca en las demás plantillas.
    for (const id of ['corona', 'zona-roja', 'kalahari']) {
      expect(renderBooyah(getTemplate(id))).not.toMatch(sealPattern);
    }
  });

  it('reveal solo añade la clase de animación en el podio (preview del editor)', () => {
    const { container: staticContainer } = render(
      <ResultImage
        vm={vm}
        config={getTemplate('booyah')}
        style={{}}
        assets={{}}
        format="4:5"
        width={1080}
        height={1350}
      />,
    );
    expect(staticContainer.querySelectorAll('.podium-reveal').length).toBe(0);
    const { container: revealed } = render(
      <ResultImage
        vm={vm}
        config={getTemplate('booyah')}
        style={{}}
        assets={{}}
        format="4:5"
        width={1080}
        height={1350}
        reveal
      />,
    );
    expect(revealed.querySelectorAll('.podium-reveal').length).toBeGreaterThan(0);
  });

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
