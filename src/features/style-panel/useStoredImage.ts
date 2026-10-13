import { useCallback, useEffect, useState } from 'react';
import { loadStoredImage, storeImage } from '../../storage/images';

function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result as string));
    reader.addEventListener('error', () => reject(new Error('No se pudo leer la imagen.')));
    reader.readAsDataURL(blob);
  });
}

export interface StoredImage {
  /** data URL mostrada ahora mismo (preview y exportación). */
  dataUrl: string | undefined;
  blob: Blob | undefined;
}

export interface StoredImageController {
  image: StoredImage;
  /** Muestra el data URL dado AL INSTANTE (reflejo inmediato en el preview). */
  show: (dataUrl: string | undefined) => void;
  /** Comprometido definitivo: guarda en IndexedDB y fija el data URL optimizado. */
  commit: (blob: Blob | undefined) => void;
}

/** Imagen persistida en IndexedDB con reflejo instantáneo al subir/cambiar. */
export function useStoredImage(key: 'logo' | 'background'): StoredImageController {
  const [blob, setBlob] = useState<Blob | undefined>(undefined);
  const [dataUrl, setDataUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    let active = true;
    loadStoredImage(key)
      .then((stored) => {
        if (!active || !stored) return;
        return toDataUrl(stored).then((url) => {
          if (active) {
            setBlob(stored);
            setDataUrl(url);
          }
        });
      })
      .catch(() => {
        // Degradación elegante: la app funciona sin imagen cargada.
      });
    return () => {
      active = false;
    };
  }, [key]);

  const show = useCallback((next: string | undefined) => {
    setDataUrl(next);
  }, []);

  const commit = useCallback(
    (next: Blob | undefined) => {
      setBlob(next);
      void storeImage(key, next);
      if (!next) {
        setDataUrl(undefined);
        return;
      }
      toDataUrl(next)
        .then((url) => setDataUrl(url))
        .catch(() => {
          // Si falla la recodificación, se conserva el preview instantáneo previo.
        });
    },
    [key],
  );

  return { image: { blob, dataUrl }, show, commit };
}
