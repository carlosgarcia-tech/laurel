import { useEffect, useState } from 'react';
import { resolveDefaultAsset } from '../../storage/defaultAssets';

export interface DefaultAssets {
  logo?: string;
  background?: string;
}

/** Carga única y cacheada de los assets por defecto del proyecto. */
export function useDefaultAssets(): DefaultAssets {
  const [assets, setAssets] = useState<DefaultAssets>({});

  useEffect(() => {
    let active = true;
    void resolveDefaultAsset('logo')
      .then((logo) => {
        if (active && logo) setAssets((current) => ({ ...current, logo }));
      })
      .catch(() => {
        // Sin asset por defecto: la UI sigue funcionando con placeholders.
      });
    void resolveDefaultAsset('background')
      .then((background) => {
        if (active && background) setAssets((current) => ({ ...current, background }));
      })
      .catch(() => {
        // Sin asset por defecto: la UI sigue funcionando con placeholders.
      });
    return () => {
      active = false;
    };
  }, []);

  return assets;
}
