/// <reference types="vite/client" />

// big-shoulders-display no publica "./*.css" en exports: sus subpaths CSS se
// importan sin extensión ("./*" → "./*.css") y no traen tipos.
declare module '@fontsource/big-shoulders-display/*';
