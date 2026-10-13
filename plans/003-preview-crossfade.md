# 003 — Preview crossfade on template/format change

- **Status**: DONE
- **Commit**: 8a07b83
- **Severity**: MEDIUM
- **Category**: Missed opportunities · Physicality & origin
- **Estimated scope**: 2 files (`src/features/templates/SharedFrame.tsx`, `src/App.tsx`), small

## Problem

Switching template or format teleports the big preview: one frame it is Corona, the next it
is a completely different palette/layout with no masking transition. The swap happens on the
scaled wrapper INSIDE `TemplateFrame`; the exportable node is the child of that wrapper.

```tsx
/* src/features/templates/SharedFrame.tsx:32-36 — current */
{
  scale > 0 && (
    <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width }}>
      <div ref={innerRef} style={{ width, height }}>
        {children}
      </div>
    </div>
  );
}
```

```tsx
/* src/App.tsx:369-376 — current call site (no key, no fade) */
<TemplateFrame
  width={CANVAS_WIDTH}
  height={canvasHeight}
  innerRef={(node) => {
    innerPreviewNode = node;
  }}
>
```

## Target

A 180ms opacity fade applied to the **scaled wrapper** (the parent of the export node — never
to the export node itself, so `html-to-image` can never capture a mid-fade opacity):

```tsx
/* src/features/templates/SharedFrame.tsx */
interface TemplateFrameProps {
  width: number;
  height: number;
  /** Ref al nodo interno SIN escala: es el que se exporta a PNG. */
  innerRef: RefCallback<HTMLDivElement>;
  /**
   * Cambia cuando el contenido se reemplaza por completo (plantilla/formato):
   * remonta el interior para reproducir el fade de 180ms que enmascara el salto.
   */
  contentKey: string;
  children: ReactNode;
}

export function TemplateFrame({
  width,
  height,
  innerRef,
  contentKey,
  children,
}: TemplateFrameProps) {
  /* …existing refs/scale logic unchanged… */
  return (
    <div
      ref={wrapperRef}
      style={{ position: 'relative', width: '100%', height: height * scale, overflow: 'hidden' }}
    >
      {scale > 0 && (
        <div
          key={contentKey}
          className="preview-fade"
          style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width }}
        >
          <div ref={innerRef} style={{ width, height }}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
```

```tsx
/* src/App.tsx — call site: pass the key (template id + format) */
<TemplateFrame
  width={CANVAS_WIDTH}
  height={canvasHeight}
  contentKey={`${template.id}-${settings.format}`}
  innerRef={(node) => {
    innerPreviewNode = node;
  }}
>
```

```css
/* src/styles/app.css — append (needs --ease-out from plan 001; apply 001 first) */
.preview-fade {
  animation: preview-in 180ms var(--ease-out) both;
}
@keyframes preview-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@media (prefers-reduced-motion: reduce) {
  .preview-fade {
    animation: none;
  }
}
```

## Repo conventions to follow

- `TemplateFrame` already isolates the exportable node via `innerRef` (comment at
  `src/features/templates/SharedFrame.tsx:7`) — the fade must stay on the wrapper that also
  holds the `scale()` transform, preserving that contract.
- CSS additions go to `src/styles/app.css`; curves come from `--ease-out` (plan 001).

## Steps

1. (Dependency) Plans/001 must be applied first so `--ease-out` exists.
2. `src/features/templates/SharedFrame.tsx`: add `contentKey` to props (Target), put
   `key={contentKey}` + `className="preview-fade"` on the scaled wrapper div.
3. `src/App.tsx`: pass `contentKey={`${template.id}-${settings.format}`}` at the call site
   (approx. line 369).
4. Append the `.preview-fade` rules to `src/styles/app.css`.
5. Do NOT pass `contentKey` from the Picker thumbnails or contact-sheet (they render
   `ResultImage` directly, not through `TemplateFrame`).

## Boundaries

- Do NOT animate `ResultImage` or anything inside the exportable node — a mid-animation
  capture would produce an opacity-wrong PNG. The animation lives ONLY on the wrapper.
- Do NOT change the `innerRef` contract or the scale math.
- No new dependencies.

## Verification

- **Mechanical**: `npm run typecheck && npx eslint src && npm run test && npm run build` — green.
  Existing tests in `tests/templates.test.tsx` render `ResultImage` directly and must stay green.
- **Feel check** (browser):
  - Click through 4+ templates fast: the preview crossfades in ~180ms; switching rapidly never
    shows a double-exposed frame or a flash of background color (the wrapper sits on
    `overflow:hidden` with the frame's own background).
  - Change 4:5 → 9:16: brief fade accompanies the reflow; no lag on the layout itself.
  - Export a PNG immediately after a template switch (within 1s): the PNG is fully opaque —
    no washed-out capture. (The animation is on the wrapper, not the exported node.)
  - Reduced motion: the switch is instant, no fade.
- **Done when**: both `contentKey` callers fade, export PNG remains pixel-identical to the
  settled preview.
