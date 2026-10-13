import { Suspense, useState } from 'react';
import type { ResultViewModel } from '../../../core/viewmodel/buildViewModel';
import type { ImageFormat } from '../../../core/types';
import { ResultImage } from '../ResultImage';
import { TEMPLATES, getTemplate, heightForFormat } from '../templates';
import { loadFontPair } from '../fonts';

interface PickerProps {
  templateId: string;
  onSelect: (id: string) => void;
  /** Datos de ejemplo para las miniaturas (VM actual con el log cargado). */
  sampleVm: ResultViewModel;
}

/** Galería (§7): miniaturas REALES de ResultImage a 1080 y escaladas a 96 px. */
export function Picker({ templateId, onSelect, sampleVm }: PickerProps) {
  const [selectedId, setSelectedId] = useState(templateId);

  function handleSelect(id: string): void {
    setSelectedId(id);
    loadFontPair(getTemplate(id).fontPairId);
    onSelect(id);
  }

  return (
    <div className="flex flex-col gap-3">
      {TEMPLATES.map((template) => {
        const isActive = selectedId === template.id;
        const format: ImageFormat = '4:5';
        const height = heightForFormat(format);
        return (
          <button
            key={template.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => handleSelect(template.id)}
            title={template.blurb}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border bg-[var(--surface)] p-3 text-left transition-colors ${
              isActive
                ? 'border-[var(--accent)]'
                : 'border-[var(--border)] hover:border-[var(--border-strong)]'
            }`}
          >
            <div
              className="shrink-0 overflow-hidden rounded-md border border-[var(--border-strong)]"
              style={{ width: 96, height: (96 / 1080) * height }}
            >
              <div
                style={{
                  width: 1080,
                  height,
                  transform: `scale(${96 / 1080})`,
                  transformOrigin: 'top left',
                }}
              >
                <Suspense
                  fallback={<div style={{ height: '100%', background: 'var(--surface-2)' }} />}
                >
                  <ResultImage
                    vm={sampleVm}
                    config={template}
                    style={{}}
                    assets={{}}
                    format={format}
                    width={1080}
                    height={height}
                  />
                </Suspense>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{template.name}</p>
              <p className="text-xs text-[var(--text-2)]">{template.blurb}</p>
              <p className="mt-1 text-[10px] tracking-widest text-[var(--muted)] uppercase">
                {`${template.theme === 'light' ? 'clara' : 'oscura'} · ${template.header} · ${template.list}`}
              </p>
            </div>
          </button>
        );
      })}
      <span className="sr-only" aria-live="polite">
        {getTemplate(selectedId).name}
      </span>
    </div>
  );
}
