import { clear, get, set } from 'idb-keyval';

const LOGO_KEY = 'laurel:logo';
const BACKGROUND_KEY = 'laurel:background';

export async function loadStoredImage(key: 'logo' | 'background'): Promise<Blob | undefined> {
  try {
    return await get<Blob>(key === 'logo' ? LOGO_KEY : BACKGROUND_KEY);
  } catch {
    return undefined;
  }
}

export function storeImage(key: 'logo' | 'background', blob: Blob | undefined): Promise<void> {
  const idbKey = key === 'logo' ? LOGO_KEY : BACKGROUND_KEY;
  try {
    return blob === undefined ? del(idbKey) : set(idbKey, blob);
  } catch {
    return Promise.resolve();
  }
}

import { del } from 'idb-keyval';

export async function clearStoredImages(): Promise<void> {
  try {
    await clear();
  } catch {
    // Ignorado: la app funciona sin storage.
  }
}
