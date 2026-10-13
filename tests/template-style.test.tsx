// @vitest-environment jsdom
/// <reference types="vite/client" />
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { computeStandings } from '../src/core/engine/calculate';
import { defaultEngineOptions } from '../src/core/engine/presets';
import { parseLog } from '../src/core/parser/parseLog';
import { buildViewModel } from '../src/core/viewmodel/buildViewModel';
import { ResultImage } from '../src/features/templates/ResultImage';
import { Picker } from '../src/features/templates/picker/Picker';
import { TEMPLATES, getTemplate } from '../src/features/templates/templates';
import { deriveTokens } from '../src/features/templates/tokens';
import { getFontPair } from '../src/features/templates/fonts';
import { i18n } from '../src/i18n/es';
import fixtureText from './fixtures/MatchResult_example_log.txt?raw';

afterEach(cleanup);

/** jsdom expone los colores inline como `rgb(r, g, b)`; comparamos en ese formato. */
function rgbOf(hex: string): string {
  const raw = hex.replace('#', '');
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

const room = parseLog(fixtureText, 'MatchResult_example_log.txt');
const rooms = [room];
const engineResult = computeStandings(rooms, defaultEngineOptions());
const vm = buildViewModel(engineResult, rooms, {
  title: 'COPA ESTELAR',
  matchday: '1',
  date: '2026-10-12',
  moderator: 'Moderador Final',
});

/** Aceptación P0.1: cada plantilla renderiza CON SUS tokens y su par de fuentes. */
describe('Cada plantilla usa su propia paleta y tipografía (AJUSTES.md P0.1)', () => {
  for (const config of TEMPLATES) {
    it(`${config.name}: bg, acento, accent2 y familia coinciden con templates.ts`, () => {
      // Sin overrides del usuario → los tokens del catálogo mandan.
      const tokens = deriveTokens(config, {});
      expect(tokens.bg).toBe(config.tokens.bg);
      expect(tokens.accent).toBe(config.tokens.accent);
      expect(tokens.accent2).toBe(config.tokens.accent2);
      expect(tokens.text).toBe(config.tokens.text);

      const { container } = render(
        <ResultImage
          vm={vm}
          config={config}
          style={{}}
          assets={{}}
          format="4:5"
          width={1080}
          height={1350}
        />,
      );
      const root = container.firstElementChild as HTMLElement;
      expect(root.style.backgroundColor).toBe(rgbOf(config.tokens.bg));
      expect(root.style.color).toBe(rgbOf(config.tokens.text));
      // Familia del par por defecto de la plantilla (p. ej. arena → Karla).
      expect(root.style.fontFamily).toContain(getFontPair(config.fontPairId).body);
    });
  }

  it('arena usa Zilla Slab + Karla (par p8) y acento terracota', () => {
    const arena = getTemplate('arena');
    expect(arena.fontPairId).toBe('p8');
    expect(deriveTokens(arena, {}).accent).toBe('#b5532a');
    expect(deriveTokens(arena, {}).accent2).toBe('#2f6f62');
    const { container } = render(
      <ResultImage
        vm={vm}
        config={arena}
        style={{}}
        assets={{}}
        format="4:5"
        width={1080}
        height={1350}
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.fontFamily).toContain('Karla');
  });

  it('el override de una plantilla no contamina a las demás', () => {
    const corona = getTemplate('corona');
    const arena = getTemplate('arena');
    // El usuario cambió el acento SOLO en Corona…
    expect(deriveTokens(corona, { accent: '#ff0000' }).accent).toBe('#ff0000');
    // …Arena sigue con su propio token.
    const arenaTokens = deriveTokens(arena, {});
    expect(arenaTokens.accent).toBe(arena.tokens.accent);
    expect(arenaTokens.accent2).toBe(arena.tokens.accent2);
  });
});

/** Aceptación P1.1 + FF §7: galería en español, pestañas, radiogroup. */
describe('Galería de plantillas (AJUSTES.md P1.1 + FF §7)', () => {
  function renderPicker(): void {
    render(<Picker templateId="corona" onSelect={() => {}} sampleVm={vm} />);
  }

  it('tiene las pestañas Todas · General · Free Fire', () => {
    renderPicker();
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((t) => t.textContent)).toEqual(['Todas', 'General', 'Free Fire']);
    expect(tabs[0]?.getAttribute('aria-selected')).toBe('true');
  });

  it('es un radiogroup con 13 opciones y etiquetas en español', () => {
    renderPicker();
    const group = screen.getByRole('radiogroup', { name: i18n.picker.groupLabel });
    expect(group).toBeTruthy();
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(13);
    expect(radios[0]?.getAttribute('aria-checked')).toBe('true');

    // Etiquetas del strip (§5.6): nombre + tema en mono, sin descripciones largas
    // ni tokens de código (LEFT/BARS/etc.) en mayúsculas.
    const coronaCard = screen.getByRole('radio', { name: /Corona/ });
    expect(coronaCard.textContent).toContain('Corona');
    expect(coronaCard.textContent).toContain('oscuro');
    const arenaCard = screen.getByRole('radio', { name: /Arena/ });
    expect(arenaCard.textContent).toContain('Arena');
    expect(arenaCard.textContent).toContain('claro');
    const pistaCard = screen.getByRole('radio', { name: /Pista/ });
    expect(pistaCard.textContent).toContain('Pista');
    expect(pistaCard.textContent).toContain('claro');
    // Tema en mono: 8 oscuras, 5 claras (Marfil, Pista, Arena, Hielo, Kalahari).
    expect(screen.getAllByText('oscuro')).toHaveLength(8);
    expect(screen.getAllByText('claro')).toHaveLength(5);

    const allText = screen
      .getAllByRole('radio')
      .map((el) => el.textContent ?? '')
      .join(' ');
    expect(allText).not.toMatch(/\b(LEFT|CENTER|SPLIT|BANNER|BARS|DOTS|CHIPS|STEPPED|ROW|HERO)\b/);
    // Insignia FF en las 3 plantillas Free Fire.
    expect(screen.getAllByText('FF')).toHaveLength(3);
  });

  it('la pestaña Free Fire filtra a las 3 plantillas FF', () => {
    renderPicker();
    fireEvent.click(screen.getByRole('tab', { name: 'Free Fire' }));
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    expect(screen.getByRole('radio', { name: /Booyah/ })).toBeTruthy();
    expect(screen.getByRole('radio', { name: /Zona Roja/ })).toBeTruthy();
    expect(screen.getByRole('radio', { name: /Kalahari/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('tab', { name: 'General' }));
    expect(screen.getAllByRole('radio')).toHaveLength(10);
    expect(screen.queryByRole('radio', { name: /Booyah/ })).toBeNull();
  });

  it('al seleccionar otra plantilla se actualiza aria-checked', () => {
    let selected = 'corona';
    const { rerender } = render(
      <Picker
        templateId={selected}
        onSelect={(id) => {
          selected = id;
          rerender(<Picker templateId={id} onSelect={() => {}} sampleVm={vm} />);
        }}
        sampleVm={vm}
      />,
    );
    fireEvent.click(screen.getByRole('radio', { name: /Arena/ }));
    expect(selected).toBe('arena');
    expect(screen.getByRole('radio', { name: /Arena/ }).getAttribute('aria-checked')).toBe('true');
    expect(screen.getByRole('radio', { name: /Corona/ }).getAttribute('aria-checked')).toBe(
      'false',
    );
  });

  it('navega con flechas y Home/End como un radiogroup (instant, sin animación)', () => {
    const instantFlags: boolean[] = [];
    let selected = 'corona';
    const select = (id: string, options?: { instant?: boolean }): void => {
      instantFlags.push(options?.instant === true);
      selected = id;
      rerender(<Picker templateId={id} onSelect={select} sampleVm={vm} />);
    };
    const { rerender } = render(<Picker templateId={selected} onSelect={select} sampleVm={vm} />);
    const group = screen.getByRole('radiogroup', { name: i18n.picker.groupLabel });
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(selected).toBe('brasa');
    fireEvent.keyDown(group, { key: 'End' });
    expect(selected).toBe('kalahari');
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(selected).toBe('corona'); // envuelve al inicio
    fireEvent.keyDown(group, { key: 'Home' });
    expect(selected).toBe('corona');
    // Teclado = cambio instantáneo (FF §6.2), nunca crossfade.
    expect(instantFlags.every(Boolean)).toBe(true);
  });

  it('el clic del ratón NO marca instant (permite crossfade)', () => {
    const flags: Array<boolean | undefined> = [];
    render(
      <Picker
        templateId="corona"
        onSelect={(_id, options) => flags.push(options?.instant)}
        sampleVm={vm}
      />,
    );
    fireEvent.click(screen.getByRole('radio', { name: /Arena/ }));
    expect(flags).toEqual([undefined]);
  });
});
