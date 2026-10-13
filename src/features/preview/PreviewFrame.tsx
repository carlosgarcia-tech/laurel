import { useEffect, useRef, useState } from 'react';
import type { ReactNode, RefCallback } from 'react';
import { CANVAS_SIZES, CANVAS_WIDTH } from './ResultImage';
import type { ImageFormat } from '../../core/types';

interface PreviewFrameProps {
  format: ImageFormat;
  /** Ref al nodo interno SIN escalar: es exactamente el que se exporta a PNG. */
  innerRef: RefCallback<HTMLDivElement>;
  children: ReactNode;
}

/**
 * Escala la imagen (tamaño lógico fijo 1080×N) al ancho disponible.
 * IMPORTANTE (AGENTS §9): la transform de escala va en una capa EXTERIOR al
 * nodo referenciado; si el propio nodo exportado tuviera la transform, el PNG
 * saldría con el contenido minimizado en la esquina superior izquierda.
 */
export function PreviewFrame({ format, innerRef, children }: PreviewFrameProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const canvasHeight = CANVAS_SIZES[format];

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const update = () => setScale(wrapper.clientWidth / CANVAS_WIDTH);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'relative',
        width: '100%',
        height: canvasHeight * scale,
        overflow: 'hidden',
      }}
    >
      {scale > 0 && (
        <>
          {/* Capa de escala: NUNCA se exporta (dead code path evitado con scale > 0). */}
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              width: CANVAS_WIDTH,
            }}
          >
            <div ref={innerRef} style={{ width: CANVAS_WIDTH }}>
              {children}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
