import type { Settings } from '../core/types';
import { FONT_PAIR_IDS } from '../features/templates/fonts';
import { TEMPLATES } from '../features/templates/templates';

const STORAGE_KEY = 'laurel:settings';
export const SCHEMA_VERSION = 3;

export const DEFAULT_SETTINGS: Settings = {
  title: '',
  matchday: '',
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
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Carga los settings guardados; versiones ≤ v3 se migran con merge sobre defaults. */
export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed: unknown = JSON.parse(raw);
    if (
      !isRecord(parsed) ||
      !isRecord(parsed.settings) ||
      typeof parsed.schemaVersion !== 'number' ||
      parsed.schemaVersion > SCHEMA_VERSION
    ) {
      return { ...DEFAULT_SETTINGS };
    }
    const merged = { ...DEFAULT_SETTINGS, ...parsed.settings } as Settings;
    return normalizeSettings(merged);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/** Normaliza al catálogo actual: pares de fuentes válidos y plantilla existente. */
export function normalizeSettings(settings: Settings): Settings {
  const fontFamily = FONT_PAIR_IDS.has(settings.fontFamily)
    ? settings.fontFamily
    : DEFAULT_SETTINGS.fontFamily;
  const templateId = TEMPLATES.some((t) => t.id === settings.templateId)
    ? settings.templateId
    : DEFAULT_SETTINGS.templateId;
  return { ...settings, fontFamily, templateId };
}

/** Guarda los settings; en modo privado o cuota llena falla en silencio controlado. */
export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: SCHEMA_VERSION, settings }));
  } catch {
    // Degradación elegante: la app funciona sin persistencia.
  }
}

/** Limpia localStorage (solo claves de la app). */
export function clearStoredSettings(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignorado: la app funciona sin storage.
  }
}
