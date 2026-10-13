# 004 — File list row entrance

- **Status**: DONE
- **Commit**: 8a07b83
- **Severity**: LOW
- **Category**: Cohesion & tokens · Missed opportunities
- **Estimated scope**: 2 files (`src/features/upload/FileList.tsx`, `src/styles/app.css`), tiny

## Problem

Newly loaded log files pop into the list with no transition, while (after plan 002) notices
fade — inconsistent entrance language across the same panel:

```tsx
/* src/features/upload/FileList.tsx:18-22 — current */
<li
  key={source.id}
  className="flex items-start justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2"
>
```

## Target

A one-shot 150ms entrance (fade + 2px rise) on mount only. Rows are keyed by `source.id`, so
re-renders (warnings, counts) do NOT restart the animation — only a newly added file plays it.

```tsx
/* src/features/upload/FileList.tsx:18-22 — className gains one class */
<li
  key={source.id}
  className="file-row-enter flex items-start justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2"
>
```

```css
/* src/styles/app.css — append (needs --ease-out from plan 001; apply 001 first) */
.file-row-enter {
  animation: file-row-in 150ms var(--ease-out) both;
}
@keyframes file-row-in {
  from {
    opacity: 0;
    transform: translateY(-2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .file-row-enter {
    animation: none;
  }
}
```

## Repo conventions to follow

- Entrance language established by `.notice` in plan 002 (`notice-in`, 150ms, `var(--ease-out)`,
  translateY ≤ 4px). File rows use the same curve/duration, smaller offset.
- Keys on `source.id` (`FileList.tsx:21`) already guarantee mount-only animation.

## Steps

1. (Dependency) Plans/001 must be applied first so `--ease-out` exists.
2. Add `file-row-enter` to the `<li>` className at `src/features/upload/FileList.tsx:22`.
3. Append the `.file-row-enter` rules to `src/styles/app.css`.
4. Do NOT add stagger delays (AUDIT.md §7: stagger must never block interaction; one row at a
   time is loaded anyway).

## Boundaries

- Do NOT touch `FileDropzone.tsx`, the notices, or anything in `src/features/templates/`.
- Do NOT use JS to animate (no rAF, no setTimeout classes) — CSS animation only.

## Verification

- **Mechanical**: `npm run typecheck && npx eslint src && npm run test && npm run build` — green.
- **Feel check** (browser):
  - Drop a log file: its row fades in with a 2px lift in 150ms; dropping 3 files at once,
    all three animate together (no stagger) and none is delayed from being clickable.
  - Toggle warnings visibility / re-render (change title): existing rows do NOT replay the
    entrance.
  - Reduced motion: rows simply appear.
- **Done when**: new rows animate once on mount, re-renders don't replay it, reduced-motion off.
