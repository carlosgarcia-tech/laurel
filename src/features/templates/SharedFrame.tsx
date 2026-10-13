import { useEffect, useRef, useState } from 'react';
import type { ReactNode, RefCallback } from 'react';

interface TemplateFrameProps {
  width: number;
  height: number;
  /**
   * Altura máxima (px lógicos) del área de escenario: la escala pasa a ser
   * min(ancho, alto) y la imagen se centra. Sin esta prop se comporta como
   * antes (escala solo por ancho, alto = alto_lógico × escala).
   */
  maxHeight?: number;
  /** Ref al nodo interno SIN escala: es el que se exporta a PNG. */
  innerRef: RefCallback<HTMLDivElement>;
  /**
   * Cambia cuando el contenido se reemplaza por completo (plantilla/formato):
   * la capa nueva hace crossfade de 140 ms sobre la anterior (FF §6.2), que
   * se desmonta al terminar. El movimiento vive SOLO aquí, nunca en el nodo
   * exportable (la capa vieja queda fuera de `innerRef`).
   */
  contentKey: string;
  /** Falso en cambio por teclado: swap instantáneo, sin crossfade (FF §6.2). */
  fade?: boolean;
  children: ReactNode;
}

/**
 * Escala al ancho (o al alto si hay `maxHeight`) disponible; el nodo interno
 * sin transform es el exportable. El contenedor llena el alto disponible cuando
 * hay `maxHeight` y centra la miniatura con flex.
 */
export function TemplateFrame({
  width,
  height,
  maxHeight,
  innerRef,
  contentKey,
  fade = true,
  children,
}: TemplateFrameProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  // Capa fantasma: snapshot del contenido anterior durante el crossfade.
  const [ghost, setGhost] = useState<{ key: string; node: ReactNode } | null>(null);
  const prevKeyRef = useRef<string | null>(null);
  const prevNodeRef = useRef<ReactNode>(children);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const update = () => setBox({ w: wrapper.clientWidth, h: wrapper.clientHeight });
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(update);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (prevKeyRef.current === null) {
      prevKeyRef.current = contentKey;
      prevNodeRef.current = children;
      return;
    }
    if (prevKeyRef.current !== contentKey) {
      // Al cambiar de plantilla/formato: la capa vieja se congela como fantasma.
      if (fade) setGhost({ key: prevKeyRef.current, node: prevNodeRef.current });
      prevKeyRef.current = contentKey;
    }
    prevNodeRef.current = children;
    const timer = window.setTimeout(() => setGhost(null), 160);
    return () => window.clearTimeout(timer);
  }, [contentKey, children, fade]);

  const scale =
    box.w > 0
      ? maxHeight !== undefined && box.h > 0
        ? Math.min(box.w / width, box.h / height)
        : box.w / width
      : 0;
  const fit = maxHeight !== undefined;

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'relative',
        width: '100%',
        ...(fit
          ? { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }
          : { height: height * scale }),
        overflow: 'hidden',
      }}
    >
      {scale > 0 && (
        <div
          style={{
            position: 'relative',
            flexShrink: 0,
            width: width * scale,
            height: height * scale,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width,
              height,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            {ghost && (
              <div
                key={ghost.key}
                aria-hidden="true"
                style={{ position: 'absolute', inset: 0, width, height }}
              >
                {ghost.node}
              </div>
            )}
            <div
              key={contentKey}
              className={fade ? 'preview-fade' : undefined}
              style={{ position: 'relative', width, height }}
            >
              <div ref={innerRef} style={{ width, height }}>
                {children}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
