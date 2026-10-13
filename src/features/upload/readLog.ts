function utf16beToLe(bytes: Uint8Array): Uint8Array {
  const swapped = bytes.slice();
  for (let i = 0; i + 1 < swapped.length; i += 2) {
    const tmp = swapped[i] ?? 0;
    swapped[i] = swapped[i + 1] ?? 0;
    swapped[i + 1] = tmp;
  }
  return swapped;
}

/** Lee un archivo de resultados como texto: UTF-8 por defecto; BOM UTF-16 → TextDecoder('utf-16le'). */
export async function readLogText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  if (bytes[0] === 0xff && bytes[1] === 0xfe) {
    // BOM UTF-16 LE (consume los primeros dos bytes).
    return new TextDecoder('utf-16le').decode(bytes.subarray(2));
  }
  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    // BOM UTF-16 BE: TextDecoder no lo soporta en todos los entornos; intercambia bytes y decodifica LE.
    return new TextDecoder('utf-16le').decode(utf16beToLe(bytes.subarray(2)));
  }
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return new TextDecoder('utf-8').decode(bytes.subarray(3));
  }
  return new TextDecoder('utf-8').decode(bytes);
}
