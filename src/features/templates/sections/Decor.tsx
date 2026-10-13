import type { Scene } from '../types';
import { transparentize } from '../tokens';

const SQUARE = 1080;

/**
 * Decoración de fondo (TEMPLATESv2 §4.5): CSS simple, baja opacidad,
 * SIEMPRE por debajo del contenido y sin interceptar el puntero.
 */
export function Decor({ scene }: { scene: Scene }) {
  const { t, config } = scene;
  const ring = (size: number, top: boolean, color: string, opacity: number) => ({
    position: 'absolute' as const,
    width: size,
    height: size,
    borderRadius: '50%',
    border: `1.5px solid ${color}`,
    opacity,
    top: top ? -size * 0.34 : undefined,
    bottom: top ? undefined : -size * 0.42,
    right: top ? -size * 0.3 : undefined,
    left: top ? undefined : -size * 0.34,
  });

  switch (config.decor) {
    case 'rings':
      return (
        <div aria-hidden="true" style={layer}>
          <div style={{ ...ring(560, true, t.accent, 0.14) }} />
          <div style={{ ...ring(720, true, t.accent, 0.07) }} />
          <div style={{ ...ring(760, false, t.accent2, 0.12) }} />
        </div>
      );
    case 'slashes': {
      // Diagonales −20° en la esquina superior derecha; anchos 40/14/14 px.
      const widths = [40, 14, 14];
      const opacities = [0.28, 0.18, 0.1];
      return (
        <div
          aria-hidden="true"
          style={{ ...layer, transform: 'rotate(-20deg)', transformOrigin: 'top right' }}
        >
          {widths.map((w, i) => (
            <div
              key={w}
              style={{
                position: 'absolute',
                top: -60,
                right: -20,
                width: w,
                height: 420,
                borderRadius: 4,
                background: t.accent,
                opacity: opacities[i] ?? 0.2,
                transform: `translateX(${-i * 48}px)`,
              }}
            />
          ))}
        </div>
      );
    }
    case 'arcs': {
      // Cuartos de círculo concéntricos desde la esquina inferior derecha.
      const radii = [240, 340, 440];
      const opacities = [0.18, 0.14, 0.1];
      const colors = [t.accent, t.accent2, t.accent];
      return (
        <div aria-hidden="true" style={layer}>
          {radii.map((r, i) => (
            <div
              key={r}
              style={{
                position: 'absolute',
                width: r * 2,
                height: r * 2,
                borderRadius: '50%',
                border: `1.5px solid ${colors[i] ?? t.accent}`,
                opacity: opacities[i] ?? 0.1,
                bottom: -r,
                right: -r,
                clipPath: 'inset(50% 0 0 50%)',
              }}
            />
          ))}
        </div>
      );
    }
    case 'brackets': {
      // Cuatro esquinas en "L" (36 px, trazo 2 px) a 28 px del borde.
      const arm = 36;
      const inset = 28;
      const corner = (hor: 'l' | 'r', ver: 't' | 'b'): React.CSSProperties => ({
        position: 'absolute',
        [hor === 'l' ? 'left' : 'right']: inset,
        [ver === 't' ? 'top' : 'bottom']: inset,
        width: arm,
        height: arm,
        borderTop: ver === 't' ? `2px solid ${t.accent}` : undefined,
        borderBottom: ver === 'b' ? `2px solid ${t.accent}` : undefined,
        borderLeft: hor === 'l' ? `2px solid ${t.accent}` : undefined,
        borderRight: hor === 'r' ? `2px solid ${t.accent}` : undefined,
        opacity: 0.5,
      });
      return (
        <div aria-hidden="true" style={layer}>
          <div style={corner('l', 't')} />
          <div style={corner('r', 't')} />
          <div style={corner('l', 'b')} />
          <div style={corner('r', 'b')} />
        </div>
      );
    }
    case 'dots':
      // Retícula de puntos 4 px, paso 22, 10×10, esquina superior derecha.
      return (
        <div
          aria-hidden="true"
          style={{
            ...layer,
            top: 24,
            right: 24,
            width: 242,
            height: 242,
            backgroundImage: `radial-gradient(${transparentize(t.accent, 0.35)} 2px, transparent 2px)`,
            backgroundSize: '22px 22px',
          }}
        />
      );
    case 'stripes': {
      // 5 líneas horizontales de 2 px (paso 12 px) en el borde superior.
      return (
        <div aria-hidden="true" style={layer}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: i * 12,
                left: 0,
                width: 330,
                height: 2,
                background: t.accent,
                opacity: 0.5 - i * 0.08,
              }}
            />
          ))}
        </div>
      );
    }
    case 'grid':
      // Cuadrícula de 48 px al 5 % del color de texto, todo el lienzo.
      return (
        <div
          aria-hidden="true"
          style={{
            ...layer,
            backgroundImage: `linear-gradient(${transparentize(t.text, 0.05)} 1px, transparent 1px), linear-gradient(90deg, ${transparentize(t.text, 0.05)} 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
      );
    case 'scan':
      // Líneas de 1 px cada 3 px al 7 % de negro: sensación de pantalla.
      return (
        <div
          aria-hidden="true"
          style={{
            ...layer,
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(0,0,0,0.07) 0 1px, transparent 1px 3px)',
          }}
        />
      );
  }
}

const layer: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: SQUARE,
  pointerEvents: 'none',
};
