import { describe, expect, it } from 'vitest';
import {
  applyAmber,
  applyDither,
  applyGrayscale,
  applyMonoInk,
  applyPixelate,
  applyScrim,
  luminance,
  type PixelBuffer,
} from '../src/features/assets/recipes';

function makeBuffer(pixels: Array<[number, number, number]>): PixelBuffer {
  const width = pixels.length;
  const data = new Uint8ClampedArray(width * 4);
  pixels.forEach(([r, g, b], index) => {
    data[index * 4] = r;
    data[index * 4 + 1] = g;
    data[index * 4 + 2] = b;
    data[index * 4 + 3] = 255;
  });
  return { width, height: 1, data };
}

describe('recetas de imagen (píxeles conocidos)', () => {
  it('scrim mezcla con la tinta pedida a la opacidad dada', () => {
    const buffer = makeBuffer([[100, 100, 100]]);
    // Tinta oscura por defecto {r:7,g:16,b:14}: 100*0.5 + tint*0.5.
    applyScrim(buffer, 0.5);
    expect(buffer.data[0]).toBe(54); // 50 + 3.5
    expect(buffer.data[1]).toBe(58); // 50 + 8
    expect(buffer.data[2]).toBe(57); // 50 + 7
    expect(buffer.data[3]).toBe(255);

    // Opacidad 0: sin cambios; tinta clara para plantillas claras.
    const intact = makeBuffer([[200, 130, 10]]);
    applyScrim(intact, 0.6, { r: 243, g: 238, b: 226 });
    expect(intact.data[0]).toBe(226); // 80 + 145.8
    expect(intact.data[1]).toBe(195); // 52 + 142.8 = 194.8
  });

  it('grayscale desatura respetando la luminancia', () => {
    const buffer = makeBuffer([[255, 0, 0]]); // luminancia ~0.2126*1 → ~54
    applyGrayscale(buffer);
    const r = buffer.data[0];
    expect(r).toBe(buffer.data[1]);
    expect(r).toBe(buffer.data[2]);
    expect(r).toBeGreaterThan(40);
    expect(r).toBeLessThan(70);
  });

  it('mono-ink deja tinta u transparencia según el umbral', () => {
    const buffer = makeBuffer([
      [20, 20, 20],
      [240, 240, 240],
    ]);
    applyMonoInk(buffer, { r: 28, g: 26, b: 22, a: 255 });
    expect([...buffer.data.slice(0, 4)]).toEqual([28, 26, 22, 255]);
    expect([...buffer.data.slice(4, 8)]).toEqual([28, 26, 22, 0]);
  });

  it('dither binariza con tinta/papel (2 tintas)', () => {
    const buffer = makeBuffer([[200, 200, 200]]);
    applyDither(buffer, { r: 0, g: 0, b: 0, a: 255 }, { r: 244, g: 241, b: 234, a: 255 });
    expect(buffer.data[0]).toBe(244); // luminancia alta → papel
  });

  it('pixelate promedia bloques', () => {
    const data = new Uint8ClampedArray(8 * 4);
    for (let i = 0; i < 8; i++) {
      data[i * 4] = i < 4 ? 0 : 200;
      data[i * 4 + 3] = 255;
    }
    const buffer: PixelBuffer = { width: 8, height: 1, data };
    applyPixelate(buffer, 2);
    expect(buffer.data[0]).toBe(0); // bloque [0..1] (todo 0)
    expect(buffer.data[2 * 4]).toBe(0); // bloque [2..3] (también 0)
    expect(buffer.data[4 * 4]).toBe(200); // bloque [4..5]
    expect(buffer.data[6 * 4]).toBe(200); // bloque [6..7]
  });

  it('amber mapea a la gama ámbar', () => {
    const buffer = makeBuffer([[255, 255, 255]]);
    applyAmber(buffer);
    expect(buffer.data[1]).toBe(176);
    expect(buffer.data[2]).toBe(32);
  });

  it('luminancia blanca = 1, negra = 0', () => {
    expect(luminance(255, 255, 255)).toBeCloseTo(1);
    expect(luminance(0, 0, 0)).toBe(0);
  });
});
