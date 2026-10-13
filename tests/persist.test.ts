// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  SCHEMA_VERSION,
  clearStoredSettings,
  loadSettings,
  normalizeSettings,
  saveSettings,
} from '../src/storage/persist';

const STORAGE_KEY = 'laurel:settings';

/** Payload tal como lo guardaba la v3 (con campos GLOBALES de estilo). */
function v3Payload(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    schemaVersion: 3,
    settings: {
      title: 'Copa',
      matchday: '1',
      date: '',
      moderator: '',
      mode: 'standard',
      tiebreak: ['kills', 'best-rank', 'booyahs'],
      positionPoints: [12, 9, 8, 7, 6, 5, 4, 3, 2, 1],
      killPoints: 1,
      fontFamily: 'p1',
      textColor: '#f4efe6',
      accentColor: '#34d399',
      format: '4:5',
      scrimOpacity: 0.65,
      theme: 'laurel',
      useDefaultLogo: true,
      useDefaultBackground: true,
      templateId: 'corona',
      styleByTemplate: {},
      ...overrides,
    },
  });
}

beforeEach(() => {
  clearStoredSettings();
});

describe('Migración de persistencia (AJUSTES.md P0.1)', () => {
  it('v3 sin personalización → sin overrides; la plantilla manda sus tokens', () => {
    localStorage.setItem(STORAGE_KEY, v3Payload());
    const settings = loadSettings();
    expect(settings.styleByTemplate).toEqual({});
    expect(settings.templateId).toBe('corona');
    // Los campos globales ya no existen en el modelo.
    expect('accentColor' in settings).toBe(false);
    expect('fontFamily' in settings).toBe(false);
  });

  it('v3 con personalización global la conserva SOLO en la plantilla activa', () => {
    localStorage.setItem(
      STORAGE_KEY,
      v3Payload({
        templateId: 'selva',
        accentColor: '#ff0000',
        textColor: '#fff000',
        fontFamily: 'p8',
      }),
    );
    const settings = loadSettings();
    expect(settings.templateId).toBe('arena'); // migración de id
    expect(settings.styleByTemplate.arena).toEqual({
      accent: '#ff0000',
      text: '#fff000',
      fontPairId: 'p8',
    });
    // No se arrastra a otras plantillas.
    expect(settings.styleByTemplate.corona).toBeUndefined();
    expect(settings.styleByTemplate.pista).toBeUndefined();
  });

  it('v3 personalizada con templateId «selva» → override sobre «arena»', () => {
    localStorage.setItem(STORAGE_KEY, v3Payload({ templateId: 'selva', accentColor: '#123456' }));
    const settings = loadSettings();
    expect(settings.templateId).toBe('arena');
    expect(settings.styleByTemplate.arena?.accent).toBe('#123456');
  });

  it('v4 roundtrip: guarda y reabre los overrides por plantilla', () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      templateId: 'arena',
      styleByTemplate: { arena: { accent: '#b5532a', fontPairId: 'p8' } },
    };
    saveSettings(settings);
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect((stored as { schemaVersion: number }).schemaVersion).toBe(SCHEMA_VERSION);
    expect(loadSettings().styleByTemplate.arena).toEqual({
      accent: '#b5532a',
      fontPairId: 'p8',
    });
  });

  it('normalizeSettings migra ids viejos y descarta pares de fuentes inválidos', () => {
    const settings = normalizeSettings({
      ...DEFAULT_SETTINGS,
      templateId: 'selva',
      styleByTemplate: { selva: { fontPairId: 'no-existe' }, corona: { fontPairId: 'p3' } },
    });
    expect(settings.templateId).toBe('arena');
    expect(settings.styleByTemplate.arena).toBeUndefined(); // par inválido → sin override
    expect(settings.styleByTemplate.corona).toEqual({ fontPairId: 'p3' });
  });
});
