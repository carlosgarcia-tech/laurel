import {
  applyAmber,
  applyDither,
  applyGrayscale,
  applyMonoInk,
  applyPixelate,
  applyScrim,
  type Insets,
  type PixelBuffer,
} from './recipes';
import { hashSeed } from '../../core/viewmodel/seed';

export type ImageRecipe =
  'original' | 'scrim' | 'grayscale' | 'halftone' | 'mono-ink' | 'amber' | 'dither' | 'pixelate';

export interface RecipeParams {
  scrimOpacity?: number;
  /** Color de la tinta del scrim (claro para plantillas claras, oscuro por defecto). */
  scrim?: { r: number; g: number; b: number };
  ink?: Insets;
  paper?: Insets;
  blockSize?: number;
  maxSide?: number;
}

const MAX_SIDE_DEFAULT = 1200;
const cache = new Map<string, string>();

function bufferFromImageData(imageData: ImageData): PixelBuffer {
  return { width: imageData.width, height: imageData.height, data: imageData.data };
}

async function toCanvas(dataUrl: string): Promise<HTMLCanvasElement> {
  const img = new Image();
  img.decoding = 'async';
  await new Promise<void>((resolve, reject) => {
    img.addEventListener('load', () => resolve());
    img.addEventListener('error', () => reject(new Error('No se pudo cargar la imagen.')));
    img.src = dataUrl;
  });
  const maxSide = MAX_SIDE_DEFAULT;
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas no disponible.');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function canvasToDataUrl(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png');
}

function grayHalfTone(source: HTMLCanvasElement): HTMLCanvasElement {
  // Media tinta: trama de puntos según luminancia muestreada en retícula.
  const out = document.createElement('canvas');
  out.width = source.width;
  out.height = source.height;
  const ctxOut = out.getContext('2d');
  const ctxIn = source.getContext('2d');
  if (!ctxOut || !ctxIn) return source;
  ctxOut.fillStyle = '#efe6d2';
  ctxOut.fillRect(0, 0, out.width, out.height);
  ctxOut.fillStyle = '#1c1a16';
  const cell = Math.max(4, Math.round(source.width / 120));
  const data = ctxIn.getImageData(0, 0, source.width, source.height).data;
  for (let y = 0; y < source.height; y += cell) {
    for (let x = 0; x < source.width; x += cell) {
      let acc = 0;
      let count = 0;
      for (let yy = y; yy < Math.min(y + cell, source.height); yy += 2) {
        for (let xx = x; xx < Math.min(x + cell, source.width); xx += 2) {
          const i = (yy * source.width + xx) * 4;
          acc +=
            (0.2126 * (data[i] ?? 0) + 0.7152 * (data[i + 1] ?? 0) + 0.0722 * (data[i + 2] ?? 0)) /
            255;
          count += 1;
        }
      }
      const lum = count > 0 ? acc / count : 1;
      const radius = Math.min(cell / 2, (cell - 2) * 0.5 * (1 - lum) * 1.6);
      if (radius > 0.6) {
        ctxOut.beginPath();
        ctxOut.arc(x + cell / 2, y + cell / 2, Math.min(radius, cell / 2), 0, Math.PI * 2);
        ctxOut.fill();
      }
    }
  }
  return out;
}

/** Procesa una imagen (data URL) con la receta pedida; caché por (hash, receta, parámetros). */
export async function processImage(
  dataUrl: string,
  recipe: ImageRecipe,
  params: RecipeParams = {},
): Promise<string> {
  const key = `${hashSeed(dataUrl).toString(36)}|${recipe}|${JSON.stringify(params)}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const source = await toCanvas(dataUrl);
  let out = source;

  switch (recipe) {
    case 'original':
      break;
    case 'halftone': {
      out = grayHalfTone(source);
      break;
    }
    default: {
      const ctx = out.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, out.width, out.height);
        const buffer = bufferFromImageData(imageData);
        const ink: Insets = params.ink ?? { r: 28, g: 26, b: 22, a: 255 };
        const paper: Insets = params.paper ?? { r: 244, g: 241, b: 234, a: 255 };
        if (recipe === 'scrim') applyScrim(buffer, params.scrimOpacity ?? 0.65, params.scrim);
        if (recipe === 'grayscale') applyGrayscale(buffer);
        if (recipe === 'mono-ink') applyMonoInk(buffer, ink);
        if (recipe === 'amber') applyAmber(buffer);
        if (recipe === 'dither') applyDither(buffer, ink, paper);
        if (recipe === 'pixelate') applyPixelate(buffer, params.blockSize ?? 8);
        ctx.putImageData(imageData, 0, 0);
      }
    }
  }

  const result = canvasToDataUrl(out);
  cache.set(key, result);
  return result;
}
