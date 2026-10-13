import { useEffect, useRef, useState } from 'react';
import type { ReactNode, RefCallback } from 'react';

interface TemplateFrameProps {
  width: number;
  height: number;
  /** Ref al nodo interno SIN escala: es el que se exporta a PNG. */
  innerRef: RefCallback<HTMLDivElement>;
  children: ReactNode;
}

/** Escala al ancho disponible; el nodo interno (sin transform) es el exportable. */
export function TemplateFrame({ width, height, innerRef, children }: TemplateFrameProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const update = () => setScale(wrapper.clientWidth / width);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'relative', width: '100%', height: height * scale, overflow: 'hidden' }}
    >
      {scale > 0 && (
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width }}>
          <div ref={innerRef} style={{ width, height }}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
