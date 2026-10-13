export function clipboardSupportsImages(): boolean {
  return (
    typeof ClipboardItem === 'function' &&
    navigator.clipboard !== undefined &&
    'write' in navigator.clipboard
  );
}

/** Copia un data URL PNG al portapapeles; false si el navegador no lo permite. */
export async function copyPngToClipboard(dataUrl: string): Promise<boolean> {
  if (!clipboardSupportsImages()) return false;
  try {
    const blob = await (await fetch(dataUrl)).blob();
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    return true;
  } catch {
    return false;
  }
}
