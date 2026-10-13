import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { computeStandings } from './core/engine/calculate';
import { parseLog } from './core/parser/parseLog';
import { buildViewModel } from './core/viewmodel/buildViewModel';
import type { Settings, TemplateStyleOverrides } from './core/types';
import { i18n } from './i18n/es';
import { clearStoredImages } from './storage/images';
import {
  DEFAULT_SETTINGS,
  clearStoredSettings,
  loadSettings,
  saveSettings,
} from './storage/persist';
import { processImage } from './features/assets/processImage';
import { CalcModePanel } from './features/calc-mode/CalcModePanel';
import { TiebreakList } from './features/calc-mode/TiebreakList';
import { copyPngToClipboard } from './features/export/copyToClipboard';
import { downloadPng, exportPng, slugifyFileName } from './features/export/exportPng';
import { FileDropzone } from './features/upload/FileDropzone';
import { FileList } from './features/upload/FileList';
import { useUploadedRooms } from './features/upload/useUploadedRooms';
import { StylePanel } from './features/style-panel/StylePanel';
import { useStoredImage } from './features/style-panel/useStoredImage';
import { useDefaultAssets } from './features/style-panel/useDefaultAssets';
import { TournamentForm } from './features/tournament-form/TournamentForm';
import { Picker } from './features/templates/picker/Picker';
import { TemplateFrame } from './features/templates/SharedFrame';
import { ResultImage } from './features/templates/ResultImage';
import { getTemplate, heightForFormat } from './features/templates/templates';
import { getFontPair, loadFontPair } from './features/templates/fonts';
import { parseTemplate, serializeTemplate, downloadJson } from './features/templates/plantillaIo';
import { Section } from './ui/Section';
import sampleLogText from './assets/sample_log.txt?raw';

const CANVAS_WIDTH = 1080;
const FORMATS: Array<Settings['format']> = ['4:5', '9:16', '1:1'];

function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const { rooms, notices, addFiles, removeRoom, setRooms } = useUploadedRooms();
  const logo = useStoredImage('logo');
  const background = useStoredImage('background');
  const defaultAssets = useDefaultAssets();
  const [processedAssets, setProcessedAssets] = useState<{ logo?: string; background?: string }>(
    {},
  );
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'ok' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusFading, setStatusFading] = useState(false);
  // Crossfade de vista previa: desactivado en el cambio por teclado (FF §6.2).
  const [previewFade, setPreviewFade] = useState(true);
  // Revelado del podio: solo la primera vez que se renderiza una jornada (FF §6.2).
  const [podiumReveal, setPodiumReveal] = useState(true);
  // Secciones colapsables: 01 abierta si no hay salas, el resto por defecto.
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => ({
    files: true,
    info: true,
    mode: false,
    tiebreak: false,
    style: false,
  }));
  // Confirmación inline de «Borrar datos» (§6): sin alert(), 4 s.
  const [confirmClear, setConfirmClear] = useState(false);
  const confirmTimer = useRef<number | undefined>(undefined);
  // Bottom sheet de plantillas (móvil, §4.1).
  const [sheetOpen, setSheetOpen] = useState(false);
  // Tira de plantillas plegable en desktop: cerrada por defecto para que el
  // preview ocupe el alto disponible (el usuario la abre bajo demanda).
  const [stripOpen, setStripOpen] = useState(false);
  // Ref al nodo exportable: se lee al momento del clic de exportar.
  const exportNodeRef = useRef<HTMLDivElement | null>(null);

  const template = getTemplate(settings.templateId);

  // Nueva jornada (o primera carga): el podio entra con stagger una sola vez.
  useEffect(() => {
    setPodiumReveal(true);
    const timer = window.setTimeout(() => setPodiumReveal(false), 600);
    return () => window.clearTimeout(timer);
  }, [settings.matchday]);

  const patch = useCallback((values: Partial<Settings>) => {
    setSettings((current) => ({ ...current, ...values }));
    // El estado de exportación no debe quedarse pegado si luego cambia algo (P0.2).
    setExportStatus((status) => (status === 'ok' || status === 'error' ? 'idle' : status));
    setStatusMessage('');
    setStatusFading(false);
  }, []);

  // Aviso "ok" (p. ej. «PNG descargado»): se auto-oculta a los 4 s con fade de salida.
  useEffect(() => {
    if (exportStatus !== 'ok') return;
    const fadeTimer = window.setTimeout(() => setStatusFading(true), 4000);
    const clearTimer = window.setTimeout(() => {
      setExportStatus('idle');
      setStatusMessage('');
      setStatusFading(false);
    }, 4150);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(clearTimer);
    };
  }, [exportStatus, statusMessage]);

  useEffect(() => {
    const timer = window.setTimeout(() => saveSettings(settings), 200);
    return () => window.clearTimeout(timer);
  }, [settings]);

  // La sección de archivos se reabre sola si se vacían las salas.
  useEffect(() => {
    if (rooms.length === 0) setOpenSections((s) => ({ ...s, files: true }));
  }, [rooms.length]);

  // Fuentes del par activo (override de la plantilla > par por defecto de la plantilla).
  const activeFontPairId = useMemo(() => {
    const overrides = settings.styleByTemplate[template.id];
    return overrides?.fontPairId ?? template.fontPairId;
  }, [settings.styleByTemplate, template.fontPairId, template.id]);
  useEffect(() => {
    loadFontPair(activeFontPairId);
  }, [activeFontPairId]);

  const engineResult = useMemo(() => {
    if (rooms.length === 0) return undefined;
    return computeStandings(
      rooms.map((source) => source.room),
      {
        mode: settings.mode,
        positionPoints: settings.positionPoints,
        killPoints: settings.killPoints,
        tiebreak: settings.tiebreak,
      },
    );
  }, [rooms, settings.mode, settings.positionPoints, settings.killPoints, settings.tiebreak]);

  // VM real si hay datos; VM de ejemplo (fixture) para explorar plantillas sin datos.
  const vm = useMemo(() => {
    const meta = {
      title: settings.title,
      matchday: settings.matchday,
      date: settings.date,
      moderator: settings.moderator,
    };
    if (engineResult && rooms.length > 0) {
      return buildViewModel(
        engineResult,
        rooms.map((source) => source.room),
        meta,
      );
    }
    const sampleRoom = parseLog(sampleLogText, 'MatchResult_example_log.txt');
    const roomsSample = [sampleRoom];
    const sampleResult = computeStandings(roomsSample, {
      mode: 'standard',
      positionPoints: DEFAULT_SETTINGS.positionPoints,
      killPoints: DEFAULT_SETTINGS.killPoints,
      tiebreak: DEFAULT_SETTINGS.tiebreak,
    });
    return buildViewModel(sampleResult, roomsSample, {
      title: 'TORNEO EJEMPLO',
      matchday: '1',
      date: '2026-10-12',
      moderator: 'Moderador',
    });
  }, [engineResult, rooms, settings.title, settings.matchday, settings.date, settings.moderator]);

  // Overrides de ESTA plantilla. Sin override → manda el token/par de la plantilla
  // (nunca el de otra plantilla): el acento/texto NO son globales (AJUSTES.md P0.1).
  const overrides = settings.styleByTemplate[template.id];
  const templateStyle = {
    accent: overrides?.accent,
    text: overrides?.text,
    fontPairId: overrides?.fontPairId,
  };

  const updateOverrides = useCallback(
    (values: Partial<TemplateStyleOverrides>) => {
      setSettings((current) => {
        const existing = current.styleByTemplate[template.id] ?? {};
        const merged: TemplateStyleOverrides = { ...existing };
        for (const key of ['accent', 'text', 'fontPairId'] as const) {
          const value = values[key];
          if (value === undefined || value === '') delete merged[key];
          else merged[key] = value;
        }
        return {
          ...current,
          styleByTemplate: { ...current.styleByTemplate, [template.id]: merged },
        };
      });
    },
    [template.id],
  );

  // Logo/fondo efectivos (usuario > por defecto). El fondo por defecto solo se
  // usa en plantillas OSCURAS; las claras van con color plano bg + decoración
  // (TEMPLATESv2 §7, FF §7). El fondo del usuario se hornea con scrim teñido
  // con el bg de la plantilla.
  const effectiveLogoRaw =
    logo.image.dataUrl ?? (settings.useDefaultLogo ? defaultAssets.logo : undefined);
  const effectiveBackgroundRaw =
    background.image.dataUrl ??
    (settings.useDefaultBackground && template.theme === 'dark'
      ? defaultAssets.background
      : undefined);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const logoProcessed =
          effectiveLogoRaw !== undefined
            ? await processImage(effectiveLogoRaw, 'original')
            : undefined;
        const scrimOpacity =
          settings.useDefaultBackground || background.image.dataUrl !== undefined
            ? settings.scrimOpacity
            : undefined;
        // Scrim teñido con el bg de la plantilla (FF §7: oscuro en booyah/
        // zona-roja, claro en kalahari), no con el color fijo de Corona.
        const scrim = hexToRgb(template.tokens.bg);
        const backgroundProcessed =
          effectiveBackgroundRaw !== undefined
            ? await processImage(effectiveBackgroundRaw, 'scrim', { scrimOpacity, scrim })
            : undefined;
        if (active) setProcessedAssets({ logo: logoProcessed, background: backgroundProcessed });
      } catch {
        if (active)
          setProcessedAssets({ logo: effectiveLogoRaw, background: effectiveBackgroundRaw });
      }
    })();
    return () => {
      active = false;
    };
  }, [
    effectiveLogoRaw,
    effectiveBackgroundRaw,
    template.tokens.bg,
    settings.scrimOpacity,
    settings.useDefaultBackground,
    background.image.dataUrl,
  ]);

  const canvasHeight = heightForFormat(settings.format);
  const exportInfo = { w: CANVAS_WIDTH * 2, h: canvasHeight * 2 };
  const hasRooms = rooms.length > 0;
  const liveTitle = i18n.liveTitle(settings.matchday, settings.title);
  const totalFiles = rooms.length;

  async function handleExport(action: 'download' | 'copy'): Promise<void> {
    const node = exportNodeRef.current;
    if (!node || !engineResult) {
      setStatusMessage(i18n.upload.noRooms);
      setExportStatus('error');
      return;
    }
    setExportStatus('exporting');
    setStatusMessage(i18n.preview.exporting);
    try {
      const dataUrl = await exportPng(node);
      if (action === 'download') {
        downloadPng(
          dataUrl,
          `resultados-${slugifyFileName(settings.title, settings.matchday)}.png`,
        );
        setStatusMessage(i18n.preview.downloadDone);
      } else {
        const copied = await copyPngToClipboard(dataUrl);
        setStatusMessage(copied ? i18n.preview.copied : i18n.preview.clipboardUnsupported);
      }
      setExportStatus('ok');
    } catch {
      setExportStatus('error');
      setStatusMessage(i18n.preview.exportError);
    }
  }

  function handleExportTemplate(): void {
    const slug = slugifyFileName('plantilla', template.name);
    downloadJson(
      serializeTemplate(settings, { logo: effectiveLogoRaw, background: effectiveBackgroundRaw }),
      `${slug}.json`,
    );
  }

  async function handleImportTemplate(file: File): Promise<void> {
    try {
      const raw = await file.text();
      const bundle = parseTemplate(raw);
      if (!bundle) {
        setExportStatus('error');
        setStatusMessage(i18n.style.templateInvalid);
        return;
      }
      setPreviewFade(true);
      patch(bundle.settings);
      if (bundle.images.logo) logo.commit(await blobFromDataUrl(bundle.images.logo));
      if (bundle.images.background)
        background.commit(await blobFromDataUrl(bundle.images.background));
      setExportStatus('ok');
      setStatusMessage(i18n.style.templateImported);
    } catch {
      setExportStatus('error');
      setStatusMessage(i18n.style.templateInvalid);
    }
  }

  function handleClearData(): void {
    if (!confirmClear) {
      setConfirmClear(true);
      window.clearTimeout(confirmTimer.current);
      confirmTimer.current = window.setTimeout(() => setConfirmClear(false), 4000);
      return;
    }
    window.clearTimeout(confirmTimer.current);
    clearStoredSettings();
    void clearStoredImages();
    logo.commit(undefined);
    background.commit(undefined);
    setSettings({ ...DEFAULT_SETTINGS });
    setRooms([]);
    window.location.reload();
  }

  function toggleSection(key: string): void {
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));
  }

  const pickerNode = (
    <Picker
      templateId={settings.templateId}
      onSelect={(id, options) => {
        setPreviewFade(options?.instant !== true);
        patch({ templateId: id });
      }}
      sampleVm={vm}
    />
  );

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
      {/* Barra superior (§4): marca, título en vivo, borrar datos. */}
      <header
        className="flex h-14 shrink-0 items-center gap-4 border-b border-[var(--line)] px-4"
        style={{ fontFamily: 'var(--font-ui)' }}
      >
        <span className="text-[17px] leading-[22px] font-semibold">{i18n.brand}</span>
        {liveTitle && (
          <span className="min-w-0 flex-1 truncate text-center text-sm text-[var(--text-2)]">
            {liveTitle}
          </span>
        )}
        <button
          type="button"
          onClick={handleClearData}
          className={`btn-text shrink-0 text-[13px] ${confirmClear ? 'text-[var(--danger)]' : ''}`}
        >
          {confirmClear ? i18n.clearDataConfirm : i18n.clearData}
        </button>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[400px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
        {/* Columna izquierda (§4): pasos 01–05, scroll propio. */}
        <div className="min-h-0 min-w-0 overflow-y-auto border-[var(--line)] px-5 py-5 lg:border-r">
          <Section
            number="01"
            title={i18n.sections.files}
            summary={
              totalFiles > 0 ? i18n.sections.filesSummary(totalFiles, rooms.length) : undefined
            }
            open={openSections.files === true}
            onToggle={() => toggleSection('files')}
          >
            {notices.length > 0 && (
              <ul className="mb-3 space-y-1 text-left" role="alert">
                {notices.map((notice) => (
                  <li key={notice.id} className="notice text-[12px] text-[var(--danger)]">
                    {`${notice.fileName}: ${notice.message}`}
                  </li>
                ))}
              </ul>
            )}
            <FileDropzone onFiles={(files) => void addFiles(files)} compact={hasRooms} />
            <FileList rooms={rooms} onRemove={removeRoom} />
          </Section>

          <Section
            number="02"
            title={i18n.sections.info}
            summary={settings.title || undefined}
            open={openSections.info === true}
            onToggle={() => toggleSection('info')}
          >
            <TournamentForm settings={settings} onChange={patch} />
          </Section>

          <Section
            number="03"
            title={i18n.sections.mode}
            summary={i18n.mode[settings.mode]}
            open={openSections.mode === true}
            onToggle={() => toggleSection('mode')}
          >
            <CalcModePanel settings={settings} engineResult={engineResult} onChange={patch} />
          </Section>

          <Section
            number="04"
            title={i18n.sections.tiebreak}
            summary={
              settings.tiebreak.length > 0
                ? i18n.mode.tiebreakOrder(settings.tiebreak.map((r) => i18n.mode[r] as string))
                : i18n.mode.tiebreakOrder([])
            }
            open={openSections.tiebreak === true}
            onToggle={() => toggleSection('tiebreak')}
          >
            <TiebreakList value={settings.tiebreak} onChange={(tiebreak) => patch({ tiebreak })} />
          </Section>

          <Section
            number="05"
            title={i18n.sections.style}
            summary={`${template.name} · ${getFontPair(activeFontPairId).label}`}
            open={openSections.style === true}
            onToggle={() => toggleSection('style')}
          >
            <StylePanel
              settings={settings}
              onChange={patch}
              config={template}
              overrides={templateStyle}
              onOverridesChange={updateOverrides}
              logo={logo}
              background={background}
              onExportTemplate={handleExportTemplate}
              onImportTemplate={(file) => void handleImportTemplate(file)}
            />
          </Section>
        </div>

        {/* Columna derecha (§4): escenario con la imagen lo más grande posible. */}
        <div className="flex min-h-0 flex-col bg-[var(--stage)]">
          <div className="relative flex min-h-0 flex-1 items-center justify-center p-3 lg:p-4">
            {/* Etiqueta EJEMPLO cuando no hay salas (§4). */}
            {!hasRooms && (
              <span
                aria-hidden="true"
                className="mono absolute top-2 right-2 z-10 border border-[var(--line-strong)] px-2 py-0.5 text-[11px] text-[var(--text-3)]"
              >
                {i18n.preview.example}
              </span>
            )}
            <TemplateFrame
              width={CANVAS_WIDTH}
              height={canvasHeight}
              maxHeight={1400}
              contentKey={`${template.id}-${settings.format}`}
              fade={previewFade}
              innerRef={(node) => {
                exportNodeRef.current = node;
              }}
            >
              <ResultImage
                vm={vm}
                config={template}
                style={templateStyle}
                assets={processedAssets}
                format={settings.format}
                width={CANVAS_WIDTH}
                height={canvasHeight}
                reveal={podiumReveal}
              />
            </TemplateFrame>
          </div>

          {/* Barra inferior compacta: formato + exportación + resolución (§5.7). */}
          <div className="shrink-0 border-t border-[var(--line)] px-4 py-2.5 lg:px-5">
            {(exportStatus === 'error' || exportStatus === 'ok') && (
              <p
                role={exportStatus === 'error' ? 'alert' : 'status'}
                aria-live={exportStatus === 'error' ? undefined : 'polite'}
                data-fading={statusFading ? 'true' : 'false'}
                className={`notice mb-2 text-[13px] ${
                  exportStatus === 'error' ? 'text-[var(--danger)]' : 'text-[var(--accent)]'
                }`}
              >
                {statusMessage}
              </p>
            )}
            <p role="status" aria-live="polite" className="sr-only">
              {exportStatus === 'exporting' ? i18n.preview.exporting : ''}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <fieldset>
                <legend className="sr-only">{i18n.preview.formatLabel}</legend>
                <div role="radiogroup" className="flex items-baseline gap-3">
                  {FORMATS.map((formatItem) => (
                    <button
                      key={formatItem}
                      type="button"
                      role="radio"
                      aria-checked={settings.format === formatItem}
                      aria-label={`${i18n.preview.formatLabel} ${formatItem}`}
                      data-active={settings.format === formatItem}
                      onClick={() => {
                        setPreviewFade(true);
                        patch({ format: formatItem });
                      }}
                      className="underline-tab mono cursor-pointer pb-1 text-[13px] text-[var(--text-2)]"
                    >
                      {formatItem}
                    </button>
                  ))}
                </div>
              </fieldset>
              <span aria-hidden="true" className="mx-1 h-4 w-px bg-[var(--line)]" />
              <button
                type="button"
                disabled={!hasRooms || exportStatus === 'exporting'}
                onClick={() => void handleExport('download')}
                className="btn btn-primary"
              >
                {exportStatus === 'exporting' ? i18n.preview.exporting : i18n.preview.download}
              </button>
              <button
                type="button"
                disabled={!hasRooms || exportStatus === 'exporting'}
                onClick={() => void handleExport('copy')}
                className="btn btn-secondary"
              >
                {i18n.preview.copy}
              </button>
              {!hasRooms && (
                <span className="text-[12px] text-[var(--text-3)]">{i18n.upload.noRooms}</span>
              )}
              <span className="mono ml-auto text-[12px] text-[var(--text-3)]">
                {i18n.preview.resolution(exportInfo.w, exportInfo.h)}
              </span>
            </div>
          </div>

          {/* Plantillas en desktop: tira plegable bajo demanda (no come alto del preview). */}
          <div className="hidden shrink-0 border-t border-[var(--line)] bg-[var(--bg)] lg:block">
            {stripOpen && (
              <div className="fade-content border-b border-[var(--line)] px-5 py-3">
                {pickerNode}
              </div>
            )}
            <div className="flex items-center justify-between px-5 py-2">
              <button
                type="button"
                aria-expanded={stripOpen}
                onClick={() => setStripOpen((v) => !v)}
                className="btn-text text-[13px]"
              >
                {`${i18n.picker.groupLabel}: ${template.name}`}
                <span aria-hidden="true" className="ml-1.5 text-[var(--text-3)]">
                  {stripOpen ? '▾' : '▴'}
                </span>
              </button>
              <span className="mono text-[11px] text-[var(--text-3)]">
                {`${template.category === 'free-fire' ? `${i18n.picker.badge} · ` : ''}${i18n.picker.theme[template.theme]}`}
              </span>
            </div>
          </div>

          {/* Móvil (§4.1): acceso a plantillas vía bottom sheet. */}
          <div className="shrink-0 border-t border-[var(--line)] px-4 py-2.5 lg:hidden">
            <button
              type="button"
              className="btn btn-secondary w-full"
              onClick={() => setSheetOpen(true)}
            >
              {i18n.picker.openSheet(template.name)}
            </button>
          </div>
          {sheetOpen && (
            <>
              <div
                aria-hidden="true"
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                onClick={() => setSheetOpen(false)}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-label={i18n.picker.groupLabel}
                className="sheet fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto border-t border-[var(--line)] bg-[var(--bg)] px-4 py-4 lg:hidden"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium">{i18n.picker.groupLabel}</span>
                  <button
                    type="button"
                    className="btn-text text-[13px]"
                    onClick={() => setSheetOpen(false)}
                  >
                    {i18n.picker.closeSheet}
                  </button>
                </div>
                {pickerNode}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Pie (§4): privacidad, sin badge. */}
      <footer className="shrink-0 border-t border-[var(--line)] px-5 py-1.5">
        <p className="text-[11px] text-[var(--text-3)]">{i18n.privacy}</p>
      </footer>
    </div>
  );
}

async function blobFromDataUrl(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}

/** `#rrggbb` → {r,g,b} para teñir el scrim con el bg de la plantilla. */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const raw = hex.replace('#', '');
  return {
    r: parseInt(raw.slice(0, 2), 16),
    g: parseInt(raw.slice(2, 4), 16),
    b: parseInt(raw.slice(4, 6), 16),
  };
}

export default App;
