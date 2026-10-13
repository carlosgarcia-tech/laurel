/**
 * Recetas de imagen puras: operan sobre buffers RGBA para poder testearse
 * sin DOM. El canvas (processImage.ts) solo carga/descarga los buffers.
 */

export interface PixelBuffer {
  width: number;
  height: number;
  /** RGBA, 4 bytes por píxel. */
  data: Uint8ClampedArray;
}

export type Insets = { r: number; g: number; b: number; a: number };

export function luminance(r: number, g: number, b: number): number {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/**
 * Receta `scrim`: capa de tinta horneada con la opacidad dada.
 * El color de la tinta es opcional (por defecto, oscuro #07100e);
 * las plantillas claras usan una tinta clara para no ensuciar la paleta.
 */
export function applyScrim(
  buffer: PixelBuffer,
  opacity: number,
  tint: { r: number; g: number; b: number } = { r: 7, g: 16, b: 14 },
): void {
  const alpha = Math.min(1, Math.max(0, opacity));
  const data = buffer.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round((data[i] ?? 0) * (1 - alpha) + tint.r * alpha);
    data[i + 1] = Math.round((data[i + 1] ?? 0) * (1 - alpha) + tint.g * alpha);
    data[i + 2] = Math.round((data[i + 2] ?? 0) * (1 - alpha) + tint.b * alpha);
  }
}

/** Receta `grayscale` con contraste leve (curvas alrededor del punto medio). */
export function applyGrayscale(buffer: PixelBuffer): void {
  const data = buffer.data;
  for (let i = 0; i < data.length; i += 4) {
    const value = luminance(data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0);
    const contrast = 1.18; // refuerzo suave
    const target = Math.min(255, Math.max(0, Math.round((value - 0.5) * 255 * contrast + 128)));
    data[i] = target;
    data[i + 1] = target;
    data[i + 2] = target;
  }
}

/** Receta `mono-ink`: umbral 1 bit; los píxeles oscuros quedan en la tinta, el resto transparente. */
export function applyMonoInk(buffer: PixelBuffer, ink: Insets): void {
  const data = buffer.data;
  for (let i = 0; i < data.length; i += 4) {
    const value = luminance(data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0);
    const alpha = value < 0.5 ? 255 : 0;
    data[i] = ink.r;
    data[i + 1] = ink.g;
    data[i + 2] = ink.b;
    data[i + 3] = alpha;
  }
}

/** Receta `amber`: monocromo ámbar 1 canal de luminancia → tono ámbar sobre negro. */
export function applyAmber(buffer: PixelBuffer): void {
  const data = buffer.data;
  for (let i = 0; i < data.length; i += 4) {
    const value = luminance(data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0);
    // Curva gamma para más rango visible en sombras.
    const t = Math.min(1, Math.max(0, Math.pow(value, 0.85)));
    data[i] = Math.round(255 * t);
    data[i + 1] = Math.round(176 * t);
    data[i + 2] = Math.round(32 * t);
    data[i + 3] = 255;
  }
}

/** Receta `dither`: 1 bit con Floyd–Steinberg entre dos tintas. */
export function applyDither(buffer: PixelBuffer, ink: Insets, paper: Insets): void {
  const { width, height, data } = buffer;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const oldPixel = luminance(data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0);
      const newPixel = oldPixel < 0.5 ? 0 : 1;
      const error = oldPixel - newPixel;
      const isInk = newPixel === 0;
      data[i] = isInk ? ink.r : paper.r;
      data[i + 1] = isInk ? ink.g : paper.g;
      data[i + 2] = isInk ? ink.b : paper.b;
      data[i + 3] = 255;
      const spread = (dx: number, dy: number, factor: number): void => {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) return;
        const ni = (ny * width + nx) * 4;
        const offset = (ni + 0) as number;
        data[offset] = Math.min(255, Math.max(0, (data[offset] ?? 0) + error * 255 * factor));
        data[ni + 1] = Math.min(255, Math.max(0, (data[ni + 1] ?? 0) + error * 255 * factor));
        data[ni + 2] = Math.min(255, Math.max(0, (data[ni + 2] ?? 0) + error * 255 * factor));
      };
      spread(1, 0, 7 / 16);
      spread(-1, 1, 3 / 16);
      spread(0, 1, 5 / 16);
      spread(1, 1, 1 / 16);
    }
  }
}

/** Receta `pixelate`: promedia bloques de `blockSize` px (sin suavizado posterior). */
export function applyPixelate(buffer: PixelBuffer, blockSize: number): void {
  const size = Math.max(1, blockSize);
  const { width, height, data } = buffer;
  for (let by = 0; by < height; by += size) {
    for (let bx = 0; bx < width; bx += size) {
      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;
      for (let y = by; y < Math.min(by + size, height); y++) {
        for (let x = bx; x < Math.min(bx + size, width); x++) {
          const i = (y * width + x) * 4;
          r += data[i] ?? 0;
          g += data[i + 1] ?? 0;
          b += data[i + 2] ?? 0;
          count += 1;
        }
      }
      if (count === 0) continue;
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      for (let y = by; y < Math.min(by + size, height); y++) {
        for (let x = bx; x < Math.min(bx + size, width); x++) {
          const i = (y * width + x) * 4;
          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
        }
      }
    }
  }
}
