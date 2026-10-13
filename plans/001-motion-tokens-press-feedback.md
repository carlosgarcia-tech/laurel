# 001 — Motion tokens + press feedback + reduced-motion base

- **Status**: DONE
- **Commit**: 8a07b83
- **Severity**: HIGH
- **Category**: Cohesion & tokens · Physicality & origin · Accessibility
- **Estimated scope**: 3 files (`src/styles/tokens.css`, `src/styles/app.css`, 4 botones en TSX), small

## Problem

The repo has zero motion tokens and zero press feedback:

```css
/* src/styles/tokens.css:1-25 — current (excerpt; no --ease-* exists at all) */
:root {
  --bg: #07100e;
  /* …colors and fonts only… */
  --font-body: 'Space Grotesk', system-ui, 'Noto Sans', 'Segoe UI Symbol', sans-serif;
}
```

```tsx
/* src/App.tsx:406 — current */
className =
  'flex-1 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-[#07100e] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none';
/* src/App.tsx:414 — copy button, same pattern, no active state */
/* src/features/upload/FileDropzone.tsx:60 — same */
className =
  'mt-3 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#07100e] hover:opacity-90';
```

Every button hover changes opacity only; there is no tactile press response. Any future
transition would hand-type a bezier because no token exists. Nothing handles
`prefers-reduced-motion`.

## Target

```css
/* src/styles/tokens.css — add inside :root, after --font-body */
/* Motion (Emil Kowalski / AUDIT.md §2) */
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
```

```css
/* src/styles/app.css — add at the end */

/* Press feedback (AUDIT.md §3): scale(0.97) + 160ms ease-out. Subtle, never more. */
.pressable {
  transition:
    transform 160ms var(--ease-out),
    opacity 160ms var(--ease-out);
}
.pressable:active:not(:disabled) {
  transform: scale(0.97);
}

/* Reduced motion (AUDIT.md §6): drop movement, keep opacity/color feedback. */
@media (prefers-reduced-motion: reduce) {
  .pressable:active:not(:disabled) {
    transform: none;
  }
}
```

Buttons that gain `pressable` in their className list (additive; keep every other class):

- `src/App.tsx:406` — download button (`Descargar PNG`)
- `src/App.tsx:414` — copy button (`Copiar imagen`)
- `src/App.tsx:281` — header `Borrar mis datos` button
- `src/features/upload/FileDropzone.tsx:60` — `Elegir archivos` button

## Repo conventions to follow

- CSS variables live in `src/styles/tokens.css`; global element styles in `src/styles/app.css`
  (exemplar: `:focus-visible` block at `src/styles/app.css:19-23` — plain CSS, no Tailwind config).
- Buttons are Tailwind-classed inline in TSX; the press behavior must be a reusable class, not
  4 duplicated `transition`/`active:` utility strings (token consolidation is the point).

## Steps

1. Add the two easing tokens to `:root` in `src/styles/tokens.css` (after `--font-body`, line 24).
2. Append the `.pressable` rules and the `prefers-reduced-motion` override to `src/styles/app.css`.
3. Add `pressable` to the className strings of the four buttons listed above (order of classes
   does not matter).
4. Do NOT touch `src/features/templates/` (the exported image is a static PNG; no motion there).

## Boundaries

- Do NOT touch anything under `src/features/templates/sections/`, `ResultImage.tsx` or the
  contact-sheet entry.
- Do NOT change markup structure — only className additions and CSS.
- Do NOT add dependencies (no Framer Motion, no Tailwind plugin).
- If a cited line drifted since commit 8a07b83, STOP and report.

## Verification

- **Mechanical**: `npm run typecheck && npx eslint src && npm run test && npm run build` — all green.
- **Feel check** (needs a browser; flag for the human if unavailable):
  - Click `Descargar PNG` / `Elegir archivos`: the button dips to 97% for ~160ms and returns —
    snappy, no bounce, no visible lag before the press.
  - DevTools → Rendering → check "Emulate prefers-reduced-motion": pressing no longer scales,
    but hover opacity still works.
- **Done when**: the 4 buttons scale on press, tokens exist, reduced-motion kills only the scale.
