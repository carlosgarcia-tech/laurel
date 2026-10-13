import type { Settings } from '../core/types';

const STORAGE_KEY = 'laurel:settings';
export const SCHEMA_VERSION = 2;

export const DEFAULT_SETTINGS: Settings = {
  title: '',
  matchday: '',
  date: '',
  moderator: '',
  mode: 'standard',
  tiebreak: ['kills', 'best-rank', 'booyahs'],
  positionPoints: [12, 9, 8, 7, 6, 5, 4, 3, 2, 1],
  killPoints: 1,
  fontFamily: 'Syne',
  textColor: '#f4efe6',
  accentColor: '#34d399',
  format: '4:5',
  scrimOpacity: 0.65,
  theme: 'laurel',
  useDefaultLogo: true,
  useDefaultBackground: true,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Carga los settings guardados; hace merge tolerante con los defaults. Nunca lanza. */
export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed: unknown = JSON.parse(raw);
    // Versiones anteriores (≤ SCHEMA_VERSION) se migran haciendo merge con defaults.
    if (
      !isRecord(parsed) ||
      !isRecord(parsed.settings) ||
      typeof parsed.schemaVersion !== 'number' ||
      parsed.schemaVersion > SCHEMA_VERSION
    ) {
      return { ...DEFAULT_SETTINGS };
    }
    return { ...DEFAULT_SETTINGS, ...parsed.settings } as Settings;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
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
