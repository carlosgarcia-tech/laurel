import { useRef, useState } from 'react';
import type { Settings, TemplateStyleOverrides } from '../../core/types';
import { FONT_PAIRS, getFontPair } from '../templates/fonts';
import type { TemplateConfig } from '../templates/types';
import { i18n } from '../../i18n/es';
import { contrastRatio } from '../../utils/color';
import { isAcceptedImage, MAX_INPUT_IMAGE_BYTES, resizeImage } from '../../utils/imageResize';
import type { StoredImageController } from './useStoredImage';

interface StylePanelProps {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  config: TemplateConfig;
  /** Overrides de la plantilla ACTIVA; vacío = tokens/par por defecto de la plantilla. */
  overrides: TemplateStyleOverrides;
  /** Escribe (o limpia) un override en la plantilla activa — nunca global. */
  onOverridesChange: (patch: Partial<TemplateStyleOverrides>) => void;
  logo: StoredImageController;
  background: StoredImageController;
  onExportTemplate: () => void;
  onImportTemplate: (file: File) => void;
}

/** Estilo (§5/§7): fuente, colores, logo y fondo — por plantilla, sin tarjetas. */
export function StylePanel({
  settings,
  onChange,
  config,
  overrides,
  onOverridesChange,
  logo,
  background,
  onExportTemplate,
  onImportTemplate,
}: StylePanelProps) {
  const [notice, setNotice] = useState<string | undefined>(undefined);
  const noticeTimer = useRef<number | undefined>(undefined);

  const effectiveFontId = overrides.fontPairId ?? config.fontPairId;
  const effectiveAccent = overrides.accent ?? config.tokens.accent;
  const effectiveText = overrides.text ?? config.tokens.text;

  const contrast = contrastRatio(effectiveText, config.tokens.bg);
  const lowContrast = contrast !== undefined && contrast < 4.5;

  async function pickImage(key: 'logo' | 'background', file: File): Promise<void> {
    if (!isAcceptedImage(file)) {
      setNotice(i18n.style.invalidImage);
      window.clearTimeout(noticeTimer.current);
      noticeTimer.current = window.setTimeout(() => setNotice(undefined), 4000);
      return;
    }
    if (file.size > MAX_INPUT_IMAGE_BYTES) {
      setNotice(`${i18n.style.invalidImage} (máx. 8 MB)`);
      return;
    }
    const controller = key === 'logo' ? logo : background;
    try {
      const dataUrl = await fileToDataUrl(file);
      controller.show(dataUrl);
      const maxSide = key === 'logo' ? 512 : 2160;
      const optimized = await resizeImage(file, maxSide);
      controller.commit(optimized);
    } catch {
      controller.commit(undefined);
      setNotice(i18n.style.invalidImage);
    }
  }

  function ImageField({
    id,
    label,
    hint,
    dataUrl,
    defaultOn,
    onToggleDefault,
    onRemove,
    onPick,
    defaultKey,
  }: {
    id: string;
    label: string;
    hint: string;
    dataUrl: string | undefined;
    defaultOn: boolean;
    onToggleDefault: (enabled: boolean) => void;
    onRemove: () => void;
    onPick: (file: File) => void;
    defaultKey: 'logo' | 'background';
  }) {
    return (
      <div className="min-w-0">
        <p className="text-xs font-medium text-[var(--text-2)]">{label}</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-[2px] border border-[var(--line-strong)] bg-[var(--stage)]">
            {dataUrl ? <img src={dataUrl} alt="" className="h-full w-full object-cover" /> : null}
          </div>
          <input
            id={id}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onPick(file);
              e.target.value = '';
            }}
          />
          <label htmlFor={id} className="btn-text cursor-pointer text-[13px]">
            {i18n.upload.choose}
          </label>
          {dataUrl && (
            <button
              type="button"
              aria-label={`${i18n.style.removeImage}: ${label}`}
              onClick={onRemove}
              className="btn-text text-[13px]"
            >
              {i18n.style.removeImage}
            </button>
          )}
        </div>
        <label
          htmlFor={`use-default-${defaultKey}`}
          className="mt-2 flex cursor-pointer items-center gap-2 text-[12px] text-[var(--text-3)]"
        >
          <input
            id={`use-default-${defaultKey}`}
            type="checkbox"
            checked={defaultOn}
            onChange={(e) => onToggleDefault(e.target.checked)}
          />
          {i18n.style.useDefault}
        </label>
        <p className="mt-1 text-[11px] text-[var(--text-3)]">{hint}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ImageField
          id="pick-logo"
          label={i18n.style.logo}
          hint={i18n.style.logoHint}
          dataUrl={logo.image.dataUrl}
          defaultOn={settings.useDefaultLogo}
          onToggleDefault={(enabled) => onChange({ useDefaultLogo: enabled })}
          onRemove={() => logo.commit(undefined)}
          onPick={(file) => void pickImage('logo', file)}
          defaultKey="logo"
        />
        <ImageField
          id="pick-background"
          label={i18n.style.fondo}
          hint={i18n.style.fondoHint}
          dataUrl={background.image.dataUrl}
          defaultOn={settings.useDefaultBackground}
          onToggleDefault={(enabled) => onChange({ useDefaultBackground: enabled })}
          onRemove={() => background.commit(undefined)}
          onPick={(file) => void pickImage('background', file)}
          defaultKey="background"
        />
      </div>

      <label className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-[var(--text-2)]">{i18n.style.scrim}</span>
        <input
          type="range"
          min={0}
          max={0.9}
          step={0.05}
          value={settings.scrimOpacity}
          onChange={(e) => onChange({ scrimOpacity: Number(e.target.value) })}
          className="w-40 accent-[var(--accent)]"
          aria-label={i18n.style.scrim}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-[var(--text-2)]">{i18n.style.font}</span>
        <select
          value={effectiveFontId}
          onChange={(e) => onOverridesChange({ fontPairId: e.target.value })}
          className="field cursor-pointer"
        >
          {FONT_PAIRS.map((pair) => (
            <option key={pair.id} value={pair.id}>
              {pair.label}
            </option>
          ))}
        </select>
        <span className="mono text-[11px] text-[var(--text-3)]">
          {`${i18n.style.fontHintPeso} ${getFontPair(effectiveFontId).displayWeights}`}
        </span>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--text-2)]">{i18n.style.accentColor}</span>
          <input
            type="color"
            value={effectiveAccent}
            onChange={(e) => onOverridesChange({ accent: e.target.value })}
            aria-label={i18n.style.accentColor}
            className="field h-10"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--text-2)]">{i18n.style.textColor}</span>
          <input
            type="color"
            value={effectiveText}
            onChange={(e) => onOverridesChange({ text: e.target.value })}
            aria-label={i18n.style.textColor}
            className="field h-10"
          />
        </label>
      </div>

      {lowContrast && (
        <p role="status" className="text-[12px] text-[var(--danger)]">
          {i18n.style.contrastWarn}
        </p>
      )}
      {notice && (
        <p role="alert" className="notice text-[12px] text-[var(--danger)]">
          {notice}
        </p>
      )}

      {/* Plantilla JSON: ajustes + imágenes embebidas */}
      <div className="flex flex-wrap items-center gap-4 border-t border-[var(--line)] pt-3">
        <input
          id="plantilla-import"
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImportTemplate(file);
            e.target.value = '';
          }}
        />
        <button type="button" onClick={onExportTemplate} className="btn-text text-[13px]">
          {i18n.style.exportTemplate}
        </button>
        <label htmlFor="plantilla-import" className="btn-text cursor-pointer text-[13px]">
          {i18n.style.importTemplate}
        </label>
      </div>
    </div>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result as string));
    reader.addEventListener('error', () => reject(new Error('No se pudo leer la imagen.')));
    reader.readAsDataURL(file);
  });
}
