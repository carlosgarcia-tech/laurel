import { useLayoutEffect, useRef, useState } from 'react';

/**
 * fitText (TEMPLATES.md §5): mide el elemento y reduce el tamaño de fuente
 * hasta que el texto quepa. Ningún texto de plantilla puede desbordar.
 */
export function useFitText(
  text: string,
  maxPx: number,
  minPx = 10,
): { ref: React.RefObject<HTMLSpanElement | null>; fontSize: number } {
  const ref = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(maxPx);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let size = maxPx;
    el.style.fontSize = `${size}px`;
    let guard = 0;
    while (el.scrollWidth > el.clientWidth && size > minPx && guard < 40) {
      const step = size > minPx + 4 ? 2 : 1;
      size -= step;
      el.style.fontSize = `${size}px`;
      guard += 1;
    }
    setFontSize(size);
  }, [text, maxPx, minPx]);

  return { ref, fontSize };
}
