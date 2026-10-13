import { useCallback, useEffect, useMemo, useState } from 'react';
import { computeStandings } from './core/engine/calculate';
import type { Settings } from './core/types';
import { i18n } from './i18n/es';
import { clearStoredImages } from './storage/images';
import {
  DEFAULT_SETTINGS,
  clearStoredSettings,
  loadSettings,
  saveSettings,
} from './storage/persist';
import { CalcModePanel } from './features/calc-mode/CalcModePanel';
import { copyPngToClipboard } from './features/export/copyToClipboard';
import { downloadPng, exportPng, slugifyFileName } from './features/export/exportPng';
import { FileDropzone } from './features/upload/FileDropzone';
import { FileList } from './features/upload/FileList';
import { useUploadedRooms } from './features/upload/useUploadedRooms';
import { PreviewFrame } from './features/preview/PreviewFrame';
import { ResultImage, CANVAS_SIZES, CANVAS_WIDTH } from './features/preview/ResultImage';
import { StylePanel } from './features/style-panel/StylePanel';
import { useStoredImage } from './features/style-panel/useStoredImage';
import { useDefaultAssets } from './features/style-panel/useDefaultAssets';
import { TournamentForm } from './features/tournament-form/TournamentForm';

interface StepCardProps {
  number: number;
  title: string;
  children: React.ReactNode;
}

function StepCard({ number, title, children }: StepCardProps) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
      <header className="mb-3 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-sm font-extrabold text-[#07100e]"
        >
          {number}
        </span>
        <h2 className="text-sm font-bold tracking-wide uppercase">{title}</h2>
      </header>
      {children}
    </section>
  );
}

const FORMATS: Array<Settings['format']> = ['4:5', '9:16', '1:1'];

function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const { rooms, notices, addFiles, removeRoom, setRooms } = useUploadedRooms();
  const logo = useStoredImage('logo');
  const background = useStoredImage('background');
  const defaultAssets = useDefaultAssets();
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'ok' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const patch = useCallback((values: Partial<Settings>) => {
    setSettings((current) => ({ ...current, ...values }));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => saveSettings(settings), 200);
    return () => window.clearTimeout(timer);
  }, [settings]);

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

  // Logo/fondo efectivos: imagen del usuario > por defecto del proyecto (si el toggle lo permite).
  const effectiveLogoUrl =
    logo.image.dataUrl ?? (settings.useDefaultLogo ? defaultAssets.logo : undefined);
  const effectiveBackgroundUrl =
    background.image.dataUrl ??
    (settings.useDefaultBackground ? defaultAssets.background : undefined);

  const exportInfo = { w: CANVAS_WIDTH * 2, h: CANVAS_SIZES[settings.format] * 2 };
  const hasRooms = rooms.length > 0;

  async function handleExport(
    action: 'download' | 'copy',
    node: HTMLElement | null,
  ): Promise<void> {
    if (!node || !engineResult) {
      setStatusMessage(i18n.preview.selectFilesFirst);
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

  function handleClearData(): void {
    clearStoredSettings();
    void clearStoredImages();
    logo.commit(undefined);
    background.commit(undefined);
    setSettings({ ...DEFAULT_SETTINGS });
    setRooms([]);
    window.location.reload();
  }

  let innerPreviewNode: HTMLDivElement | null = null;

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-4 pt-6 sm:px-6">
        <div className="flex items-baseline gap-3">
          <h1
            className="text-2xl font-extrabold tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {i18n.brand}
          </h1>
          <span className="text-sm text-[var(--text-2)]">{i18n.tagline}</span>
        </div>
        <span className="hidden rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs text-[var(--text-2)] sm:inline">
          {i18n.privacyBadge}
        </span>
        <button
          type="button"
          onClick={handleClearData}
          className="ml-auto rounded-lg border border-[var(--border-strong)] px-3 py-1.5 text-xs text-[var(--text-2)] hover:border-[var(--bronze)] hover:text-[var(--bronze)]"
        >
          {i18n.clearData}
        </button>
      </header>

      <main className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-3 pb-10 pt-5 sm:px-6 sm:gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        {/* En móvil la vista previa va arriba */}
        <div className="order-2 flex min-w-0 flex-col gap-4 lg:order-1">
          <StepCard number={1} title={i18n.steps.files}>
            <FileDropzone onFiles={(files) => void addFiles(files)}>
              {notices.length > 0 && (
                <ul className="mt-3 space-y-1 text-left" role="alert">
                  {notices.map((notice) => (
                    <li
                      key={notice.id}
                      className="rounded-md border border-[var(--bronze)] bg-[var(--surface-2)] px-2 py-1 text-[11px] text-[var(--bronze)]"
                    >
                      {`${notice.fileName}: ${notice.message}`}
                    </li>
                  ))}
                </ul>
              )}
            </FileDropzone>
            <FileList rooms={rooms} onRemove={removeRoom} />
          </StepCard>

          <StepCard number={2} title={i18n.steps.info}>
            <TournamentForm settings={settings} onChange={patch} />
          </StepCard>

          <StepCard number={3} title={i18n.steps.mode}>
            <CalcModePanel settings={settings} engineResult={engineResult} onChange={patch} />
          </StepCard>

          <StepCard number={4} title={i18n.steps.style}>
            <StylePanel settings={settings} onChange={patch} logo={logo} background={background} />
          </StepCard>
        </div>

        <div className="order-1 flex min-w-0 flex-col gap-4 lg:order-2 lg:sticky lg:top-4 lg:self-start">
          <div className="w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold tracking-wide uppercase">Vista previa</h2>
                <p className="text-[11px] text-[var(--muted)]">
                  {i18n.preview.help(exportInfo.w, exportInfo.h)}
                </p>
              </div>
              <fieldset>
                <legend className="sr-only">{i18n.preview.formatLabel}</legend>
                <div className="flex gap-1 rounded-lg border border-[var(--border-strong)] p-1">
                  {FORMATS.map((formatItem) => (
                    <label
                      key={formatItem}
                      className="cursor-pointer rounded-md px-3 py-1 text-xs has-[:checked]:bg-[var(--accent)] has-[:checked]:text-[#07100e]"
                    >
                      <input
                        type="radio"
                        name="choose-format"
                        className="sr-only"
                        checked={settings.format === formatItem}
                        onChange={() => patch({ format: formatItem })}
                      />
                      {formatItem}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            {engineResult ? (
              <PreviewFrame
                format={settings.format}
                innerRef={(node) => {
                  innerPreviewNode = node;
                }}
              >
                <ResultImage
                  result={engineResult}
                  settings={settings}
                  logoUrl={effectiveLogoUrl}
                  backgroundUrl={effectiveBackgroundUrl}
                />
              </PreviewFrame>
            ) : (
              <div className="grid h-72 place-items-center rounded-xl border border-dashed border-[var(--border-strong)] p-6 text-center">
                <div>
                  <p className="font-medium">{i18n.preview.emptyTitle}</p>
                  <p className="mt-1 text-xs text-[var(--text-2)]">{i18n.preview.emptyBody}</p>
                </div>
              </div>
            )}

            {exportStatus === 'error' && (
              <p role="alert" className="mt-3 text-xs text-[var(--bronze)]">
                {statusMessage}
              </p>
            )}
            {exportStatus === 'ok' && (
              <p role="status" className="mt-3 text-xs text-[var(--accent)]">
                {statusMessage}
              </p>
            )}
            <p role="status" aria-live="polite" className="sr-only">
              {exportStatus === 'exporting' ? i18n.preview.exporting : ''}
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!hasRooms || exportStatus === 'exporting'}
                onClick={() => void handleExport('download', innerPreviewNode)}
                className="flex-1 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-[#07100e] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
              >
                {exportStatus === 'exporting' ? i18n.preview.exporting : i18n.preview.download}
              </button>
              <button
                type="button"
                disabled={!hasRooms || exportStatus === 'exporting'}
                onClick={() => void handleExport('copy', innerPreviewNode)}
                className="flex-1 rounded-lg border border-[var(--border-strong)] px-5 py-2.5 text-sm font-semibold text-[var(--text)] hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
              >
                {i18n.preview.copy}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
