import type { Settings, TemplateStyleOverrides } from '../core/types';
import { FONT_PAIR_IDS } from '../features/templates/fonts';
import { TEMPLATES, migrateTemplateId } from '../features/templates/templates';

const STORAGE_KEY = 'laurel:settings';
export const SCHEMA_VERSION = 4;

export const DEFAULT_SETTINGS: Settings = {
  title: '',
  matchday: '',
  date: '',
  moderator: '',
  mode: 'standard',
  tiebreak: ['kills', 'best-rank', 'booyahs'],
  positionPoints: [12, 9, 8, 7, 6, 5, 4, 3, 2, 1],
  killPoints: 1,
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

/** Carga los settings guardados; versiones viejas se migran antes de normalizar. */
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
    let settings = { ...DEFAULT_SETTINGS, ...parsed.settings } as Settings;
    if (parsed.schemaVersion < 4) settings = migrateV3ToV4(settings, parsed.settings);
    return normalizeSettings(settings);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * v3 → v4: los colores/fuentes GLOBALES dejan de existir; cada plantilla usa sus
 * propios tokens salvo que el usuario los haya personalizado. Lo guardado en v3
 * solo se conserva como override de la plantilla que estaba activa al guardar
 * (lo que el usuario realmente veía), sin contaminar al resto (AJUSTES.md P0.1).
 * También renombra `selva` → `arena`.
 */
function migrateV3ToV4(settings: Settings, raw: Record<string, unknown>): Settings {
  const templateId = migrateTemplateId(settings.templateId);
  const styleByTemplate: Record<string, TemplateStyleOverrides> = {
    ...settings.styleByTemplate,
  };

  const accentColor = typeof raw.accentColor === 'string' ? raw.accentColor : undefined;
  const textColor = typeof raw.textColor === 'string' ? raw.textColor : undefined;
  const fontFamily = typeof raw.fontFamily === 'string' ? raw.fontFamily : undefined;
  const hadCustomization =
    (accentColor !== undefined && accentColor !== DEFAULT_ACCENT_V3) ||
    (textColor !== undefined && textColor !== DEFAULT_TEXT_V3) ||
    (fontFamily !== undefined && fontFamily !== DEFAULT_FONT_V3);

  if (hadCustomization) {
    const existing = styleByTemplate[templateId] ?? {};
    styleByTemplate[templateId] = {
      accent: existing.accent ?? accentColor,
      text: existing.text ?? textColor,
      fontPairId: existing.fontPairId ?? fontFamily,
    };
  }

  const migrated = { ...settings, templateId, styleByTemplate } as Settings &
    Record<string, unknown>;
  // Campos globales de la v3: ya no existen, no deben reentrar en el estado.
  delete migrated.accentColor;
  delete migrated.textColor;
  delete migrated.fontFamily;
  return migrated;
}

// Valores por defecto de la v3, para detectar personalización real.
const DEFAULT_ACCENT_V3 = '#34d399';
const DEFAULT_TEXT_V3 = '#f4efe6';
const DEFAULT_FONT_V3 = 'p1';

/**
 * Normaliza al catálogo actual: plantilla existente (con migración de ids) y
 * overrides con par de fuentes válido. El acento/texto se dejan tal cual:
 * si no hay override, la plantilla manda sus tokens.
 */
export function normalizeSettings(settings: Settings): Settings {
  const templateId = TEMPLATES.some((t) => t.id === migrateTemplateId(settings.templateId))
    ? migrateTemplateId(settings.templateId)
    : DEFAULT_SETTINGS.templateId;

  const styleByTemplate: Record<string, TemplateStyleOverrides> = {};
  if (isRecord(settings.styleByTemplate)) {
    for (const [id, value] of Object.entries(settings.styleByTemplate)) {
      if (!isRecord(value)) continue;
      const overrides: TemplateStyleOverrides = {};
      if (typeof value.accent === 'string') overrides.accent = value.accent;
      if (typeof value.text === 'string') overrides.text = value.text;
      if (typeof value.fontPairId === 'string' && FONT_PAIR_IDS.has(value.fontPairId)) {
        overrides.fontPairId = value.fontPairId;
      }
      if (Object.keys(overrides).length > 0) styleByTemplate[migrateTemplateId(id)] = overrides;
    }
  }

  return { ...settings, templateId, styleByTemplate };
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
