# 002 — Status notices: auto-dismiss + fade in/out

- **Status**: DONE
- **Commit**: 8a07b83
- **Severity**: MEDIUM
- **Category**: Missed opportunities · Purpose & frequency · Accessibility
- **Estimated scope**: 2 files (`src/App.tsx`, `src/styles/app.css`) + 1 className in `StylePanel.tsx`, small

## Problem

The export status message ("PNG descargado") appears and disappears with no transition and,
worse, the success state **never auto-dismisses** (AJUSTES.md P0.2 requires ≈4s + `aria-live="polite"`)
and sticks around after the user changes settings:

```tsx
/* src/App.tsx:387-396 — current */
{
  exportStatus === 'error' && (
    <p role="alert" className="mt-3 text-xs text-[var(--bronze)]">
      {statusMessage}
    </p>
  );
}
{
  exportStatus === 'ok' && (
    <p role="status" className="mt-3 text-xs text-[var(--accent)]">
      {statusMessage}
    </p>
  );
}
```

There is no timer anywhere in `App.tsx` for `exportStatus`. The correct timer pattern already
exists in the repo (exemplar below).

## Target

```tsx
/* src/App.tsx — state additions next to the existing exportStatus state */
const [statusFading, setStatusFading] = useState(false);

/* auto-hide "ok" after 4s, fade out 150ms, then reset */
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
```

```tsx
/* patch() must also clear a sticky status (AJUSTES.md P0.2: "el estado no debe
   quedarse pegado si luego se cambia algo") */
const patch = useCallback((values: Partial<Settings>) => {
  setSettings((current) => ({ ...current, ...values }));
  setExportStatus((status) => (status === 'ok' || status === 'error' ? 'idle' : status));
  setStatusMessage('');
  setStatusFading(false);
}, []);
```

```tsx
/* both message <p> elements get the class and the data attribute */
<p
  role={exportStatus === 'error' ? 'alert' : 'status'}
  aria-live={exportStatus === 'error' ? undefined : 'polite'}
  data-fading={statusFading ? 'true' : 'false'}
  className={`notice mt-3 text-xs ${exportStatus === 'error' ? 'text-[var(--bronze)]' : 'text-[var(--accent)]'}`}
>
  {statusMessage}
</p>
```

```css
/* src/styles/app.css — append (requires --ease-out from plan 001; apply 001 first) */
.notice {
  animation: notice-in 150ms var(--ease-out) both;
  transition:
    opacity 150ms var(--ease-out),
    transform 150ms var(--ease-out);
}
.notice[data-fading='true'] {
  opacity: 0;
  transform: translateY(-4px);
}
@keyframes notice-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .notice {
    animation: none;
    transition: opacity 150ms linear;
  }
  .notice[data-fading='true'] {
    transform: none;
  }
}
```

Also add `notice` to the existing status `<p>` in `src/features/style-panel/StylePanel.tsx:229-234`
(importing nothing new — class only) so invalid-image notices behave identically (cohesion).

## Repo conventions to follow

- Timer + `window.clearTimeout` pattern: `src/features/style-panel/StylePanel.tsx:30-41`
  (`noticeTimer` ref, 4000ms, cleared on new notice) — imitate this, adapted to `useEffect`.
- Status copy already centralized in `src/i18n/es.ts:98` (`downloadDone: 'PNG descargado'`).

## Steps

1. (Dependency) Plans/001 must be applied first so `--ease-out` exists.
2. `src/App.tsx`: add `statusFading` state, the auto-hide `useEffect`, and the status reset
   inside `patch` exactly as in Target.
3. `src/App.tsx`: replace the two message `<p>` blocks (lines ~387-396) with the single combined
   block from Target (keep them inside the same parent; delete the now-redundant sr-only
   exporting live region only if it becomes duplicate — keep it, it announces "Generando
   imagen…" during export and is still needed).
4. `src/styles/app.css`: append the `.notice` rules from Target.
5. `src/features/style-panel/StylePanel.tsx:230`: add `notice` to the className of the
   `role="alert"` paragraph.
6. Do NOT touch export logic (`exportPng.ts`, `copyToClipboard.ts`).

## Boundaries

- Do NOT change i18n strings.
- Do NOT alter `handleExport` control flow beyond what Target shows (the fade timers live in
  an effect, not inside the async function).
- If `patch` is not at `src/App.tsx:73-75` (drift since 8a07b83), locate the real `patch`
  callback and apply the same reset there; if there are multiple setters, STOP and report.

## Verification

- **Mechanical**: `npm run typecheck && npx eslint src && npm run test && npm run build` — green.
- **Feel check** (browser):
  - Download a PNG: "PNG descargado" slides+fade-ins in 150ms, sits ~4s, fades up 4px and
    disappears at ~4.15s. No stuck state.
  - Right after a download, change the tournament title: the message clears immediately.
  - Reduced motion (DevTools Rendering): the message appears and disappears without movement;
    the fade remains.
- **Done when**: message visible ≤ 4.15s, patch() clears sticky status, no console warnings.
