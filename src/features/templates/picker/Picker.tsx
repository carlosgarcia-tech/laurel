import { Suspense, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { ResultViewModel } from '../../../core/viewmodel/buildViewModel';
import { ResultImage } from '../ResultImage';
import { TEMPLATES, heightForFormat } from '../templates';
import { i18n } from '../../../i18n/es';
import type { TemplateConfig } from '../types';

interface PickerProps {
  templateId: string;
  onSelect: (id: string, options?: { instant?: boolean }) => void;
  /** Datos de ejemplo para las miniaturas (VM actual con el log cargado). */
  sampleVm: ResultViewModel;
}

type TabId = 'all' | 'general' | 'free-fire';

const TAB_ORDER: TabId[] = ['all', 'general', 'free-fire'];
const TAB_INDEX: Record<TabId, number> = { all: 0, general: 1, 'free-fire': 2 };

const THUMB_WIDTH = 1080;
const THUMB_HEIGHT = heightForFormat('4:5');
/** Ancho fijo de la miniatura en la tira (§5.6, compacto para desktop). */
const THUMB_CSS_WIDTH = 112;
const THUMB_SCALE = THUMB_CSS_WIDTH / THUMB_WIDTH;
const THUMB_GAP = 12;
const SCROLL_STEP = (THUMB_CSS_WIDTH + THUMB_GAP) * 2;

function visibleTemplates(tab: TabId): TemplateConfig[] {
  return tab === 'all' ? TEMPLATES : TEMPLATES.filter((t) => t.category === tab);
}

/**
 * Tira de plantillas bajo el escenario (UI-REDESIGN §5.6): pestañas como texto
 * con subrayado, miniaturas REALES con scroll-snap y flechas de carrusel,
 * filete de selección por opacidad, teclado con cambio instantáneo.
 */
export function Picker({ templateId, onSelect, sampleVm }: PickerProps) {
  const [tab, setTab] = useState<TabId>('all');
  const stripRef = useRef<HTMLDivElement>(null);
  const visible = visibleTemplates(tab);

  function scrollStrip(dir: -1 | 1): void {
    stripRef.current?.scrollBy({ left: dir * SCROLL_STEP, behavior: 'smooth' });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    const index = visible.findIndex((t) => t.id === templateId);
    if (index < 0) return;
    let next = index;
    switch (event.key) {
      case 'ArrowRight':
        next = (index + 1) % visible.length;
        break;
      case 'ArrowLeft':
        next = (index - 1 + visible.length) % visible.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = visible.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    const target = visible[next];
    if (!target) return;
    // Teclado = acción repetida: cambio instantáneo, sin crossfade (FF §6.2).
    onSelect(target.id, { instant: true });
    window.requestAnimationFrame(() => {
      document.getElementById(`template-radio-${target.id}`)?.focus();
    });
  }

  return (
    <div>
      <div role="tablist" aria-label={i18n.picker.tabsLabel} className="flex items-baseline gap-4">
        {TAB_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            tabIndex={tab === id ? 0 : -1}
            onClick={() => setTab(id)}
            onKeyDown={(event) => {
              if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
              event.preventDefault();
              const delta = event.key === 'ArrowRight' ? 1 : -1;
              const next = TAB_ORDER[(TAB_INDEX[id] + delta + TAB_ORDER.length) % TAB_ORDER.length];
              if (!next) return;
              setTab(next);
              document.getElementById(`template-tab-${next}`)?.focus();
            }}
            id={`template-tab-${id}`}
            className="underline-tab cursor-pointer pb-1.5 text-[13px] font-medium text-[var(--text-2)] focus-visible:outline-none"
            style={{ color: tab === id ? 'var(--text)' : undefined }}
          >
            {i18n.picker.tabs[id]}
          </button>
        ))}
      </div>
      <div className="relative mt-3">
        <button
          type="button"
          aria-label={i18n.picker.scrollPrev}
          onClick={() => scrollStrip(-1)}
          className="absolute top-0 left-0 z-10 flex h-[140px] w-7 items-center justify-center bg-gradient-to-r from-[var(--bg)] to-transparent text-lg text-[var(--text-2)] transition-colors hover:text-[var(--text)]"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label={i18n.picker.scrollNext}
          onClick={() => scrollStrip(1)}
          className="absolute top-0 right-0 z-10 flex h-[140px] w-7 items-center justify-center bg-gradient-to-l from-[var(--bg)] to-transparent text-lg text-[var(--text-2)] transition-colors hover:text-[var(--text)]"
        >
          ›
        </button>
        <div
          ref={stripRef}
          role="radiogroup"
          aria-label={i18n.picker.groupLabel}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          className="strip-scroll flex gap-3 px-7 pb-1"
        >
          {visible.map((template) => (
            <TemplateStripItem
              key={template.id}
              template={template}
              isActive={template.id === templateId}
              sampleVm={sampleVm}
              onSelect={(id) => onSelect(id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface TemplateStripItemProps {
  template: TemplateConfig;
  isActive: boolean;
  sampleVm: ResultViewModel;
  onSelect: (id: string) => void;
}

function TemplateStripItem({ template, isActive, sampleVm, onSelect }: TemplateStripItemProps) {
  return (
    <button
      id={`template-radio-${template.id}`}
      type="button"
      role="radio"
      aria-checked={isActive}
      tabIndex={isActive ? 0 : -1}
      onClick={() => onSelect(template.id)}
      title={template.blurb}
      style={{ width: THUMB_CSS_WIDTH }}
      className="strip-thumb relative shrink-0 cursor-pointer text-left focus-visible:outline-none"
    >
      {/* Filete de selección: 2 px accent FUERA de la miniatura (§5.6), opacidad 160 ms. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[-2px] z-10 border-2 border-[var(--accent)] transition-opacity duration-[160ms] ease-[var(--ease-out)]"
        style={{ opacity: isActive ? 1 : 0 }}
      />
      <div
        className="aspect-[4/5] w-full overflow-hidden rounded-[2px] border border-[var(--line)] bg-[var(--stage)]"
        aria-hidden="true"
      >
        <div
          style={{
            width: THUMB_WIDTH,
            height: THUMB_HEIGHT,
            transform: `scale(${THUMB_SCALE})`,
            transformOrigin: 'top left',
          }}
        >
          <Suspense fallback={null}>
            <ResultImage
              vm={sampleVm}
              config={template}
              style={{}}
              assets={{}}
              format="4:5"
              width={THUMB_WIDTH}
              height={THUMB_HEIGHT}
            />
          </Suspense>
        </div>
      </div>
      <p className="mt-1.5 flex items-baseline gap-1.5 text-[13px] leading-tight font-medium text-[var(--text)]">
        <span className="min-w-0 truncate">{template.name}</span>
        {template.category === 'free-fire' && (
          <span
            className="mono shrink-0 text-[10px] text-[var(--text-2)]"
            title={i18n.picker.freeFireBadgeTitle}
          >
            {i18n.picker.badge}
          </span>
        )}
      </p>
      <p className="mono text-[11px] text-[var(--text-2)]">{i18n.picker.theme[template.theme]}</p>
    </button>
  );
}
