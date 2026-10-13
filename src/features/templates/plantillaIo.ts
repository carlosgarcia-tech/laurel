import type { Settings, TemplateStyleOverrides } from '../../core/types';
import { TEMPLATES, migrateTemplateId } from './templates';
import { FONT_PAIR_IDS } from './fonts';

export interface TemplateBundle {
  version: 1;
  app: 'laurel-template';
  settings: Settings;
  images: { logo?: string; background?: string };
}

export function serializeTemplate(
  settings: Settings,
  images: { logo?: string; background?: string },
): string {
  const bundle: TemplateBundle = { version: 1, app: 'laurel-template', settings, images };
  return JSON.stringify(bundle, null, 2);
}

export function downloadJson(content: string, fileName: string): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Settings con valores de catálogo garantizados: plantilla y overrides
 * existentes (si no, defaults), para no tumbar la app con un JSON ajeno.
 * Los campos globales de la v3 (accentColor/textColor/fontFamily) se ignoran.
 */
function sanitizeSettings(raw: Settings): Settings {
  const templateId = TEMPLATES.some((t) => t.id === migrateTemplateId(raw.templateId))
    ? migrateTemplateId(raw.templateId)
    : TEMPLATES[0]!.id;

  const styleByTemplate: Record<string, TemplateStyleOverrides> = {};
  const source = (raw as unknown as Record<string, unknown>).styleByTemplate;
  if (isRecord(source)) {
    for (const [id, value] of Object.entries(source)) {
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

  const settings = { ...raw, templateId, styleByTemplate } as Settings & Record<string, unknown>;
  // Campos globales de la v3: no existen más, no deben reentrar en el estado.
  delete settings.accentColor;
  delete settings.textColor;
  delete settings.fontFamily;
  return settings;
}

/** Valida e interpreta un JSON de plantilla; null si es inválido. */
export function parseTemplate(raw: string): TemplateBundle | undefined {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.app !== 'laurel-template' || !isRecord(parsed.settings)) {
      return undefined;
    }
    const images: TemplateBundle['images'] = {};
    if (isRecord(parsed.images)) {
      if (typeof parsed.images.logo === 'string') images.logo = parsed.images.logo;
      if (typeof parsed.images.background === 'string')
        images.background = parsed.images.background;
    }
    return {
      version: 1,
      app: 'laurel-template',
      settings: sanitizeSettings(parsed.settings as unknown as Settings),
      images,
    };
  } catch {
    return undefined;
  }
}
