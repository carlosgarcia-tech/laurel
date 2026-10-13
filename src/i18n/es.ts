/** Textos de la UI centralizados en español (es-MX) — UI-REDESIGN §6. */
export const i18n = {
  brand: 'Laurel',
  clearData: 'Borrar datos',
  clearDataConfirm: '¿Seguro? Borrar',
  privacy: 'Todo se procesa en tu navegador. Los archivos no se suben.',

  liveTitle: (matchday: string, title: string) => {
    const parts = [matchday.trim() && `Jornada ${matchday.trim()}`, title.trim()].filter(Boolean);
    return parts.join(' · ');
  },

  sections: {
    files: 'Resultados',
    filesSummary: (files: number, rooms: number) =>
      `${files} ${files === 1 ? 'archivo' : 'archivos'} · ${rooms} ${rooms === 1 ? 'sala' : 'salas'}`,
    info: 'Torneo',
    mode: 'Cálculo',
    tiebreak: 'Desempate',
    style: 'Estilo',
    edit: 'Editar',
  },

  upload: {
    dropHint: 'Suelta aquí tus logs (.txt o .log), uno por sala',
    choose: 'elegir archivos',
    addMore: 'Añadir más',
    remove: 'quitar',
    sala: 'Sala',
    equipos: 'equipos',
    kills: 'kills',
    warnings: (n: number) => `${n} ${n === 1 ? 'advertencia' : 'advertencias'}`,
    noRooms: 'Carga al menos un log para exportar.',
  },

  form: {
    title: 'Título',
    titlePlaceholder: 'Copa Estelar',
    matchday: 'Jornada',
    date: 'Fecha',
    moderator: 'Moderador',
    moderatorPlaceholder: 'Moderador',
  },

  mode: {
    standard: 'Score del log',
    standardDesc: 'Usa el TotalScore tal cual',
    'position-kills': 'Posición + kills',
    'position-killsDesc': 'Recalcula con tu tabla de puntos',
    'kills-only': 'Solo kills',
    'kills-onlyDesc': 'Cada kill suma, nada más',
    custom: 'Personalizado',
    customDesc: 'Tu tabla de puntos y multiplicador de kills',
    tiebreakNote: 'Si hay empate en el total, se decide en este orden',
    kills: 'Más kills',
    'best-rank': 'Mejor rank logrado',
    booyahs: 'Más booyahs',
    moveUp: 'Subir',
    moveDown: 'Bajar',
    tiebreakOrder: (labels: string[]) => `Orden de desempate: ${labels.join(', ')}`,
    positionTable: 'Tabla de posiciones',
    killPoints: 'Puntos por kill',
    similarTeamsTitle: 'Nombres casi iguales entre salas',
    similarTeamsNote:
      'Si son el mismo equipo con un error tipográfico, corrige el nombre en tu log antes de exportar.',
    resetTable: 'Restablecer tabla por defecto',
  },

  picker: {
    groupLabel: 'Plantillas',
    tabsLabel: 'Categorías de plantillas',
    tabs: {
      all: 'Todas',
      general: 'General',
      'free-fire': 'Free Fire',
    },
    badge: 'FF',
    freeFireBadgeTitle: 'Plantilla Free Fire',
    theme: {
      dark: 'oscuro',
      light: 'claro',
    },
    openSheet: (name: string) => `Plantilla: ${name}`,
    closeSheet: 'Cerrar',
    scrollPrev: 'Plantillas anteriores',
    scrollNext: 'Plantillas siguientes',
  },

  style: {
    logo: 'Logo',
    logoHint: 'PNG, JPG o WebP · se optimiza a máx. 512 px',
    fondo: 'Fondo',
    fondoHint: 'PNG, JPG o WebP · se optimiza a máx. 2160 px',
    removeImage: 'Eliminar',
    font: 'Tipo de fuente',
    fontHintPeso: 'Pesos display',
    textColor: 'Color de fuente',
    accentColor: 'Color de acento',
    scrim: 'Oscuridad del fondo',
    contrastWarn: 'El contraste del color de fuente con el fondo es bajo.',
    invalidImage: 'Formato no soportado',
    useDefault: 'Usar el por defecto si no subes uno',
    exportTemplate: 'Exportar plantilla (JSON)',
    importTemplate: 'Importar plantilla (JSON)',
    templateImported: 'Plantilla importada',
    templateInvalid: 'El archivo no es una plantilla de Laurel válida.',
  },

  preview: {
    example: 'EJEMPLO',
    formatLabel: 'Formato',
    download: 'Descargar PNG',
    copy: 'Copiar imagen',
    exporting: 'Generando imagen…',
    copied: 'Imagen copiada',
    downloadDone: 'PNG descargado',
    exportError: 'No se pudo exportar la imagen. Intenta de nuevo.',
    clipboardUnsupported: 'Tu navegador no permite copiar imágenes. Descarga el PNG.',
    resolution: (w: number, h: number) => `${w} × ${h}`,
  },

  pill: {
    equipos: 'Equipos',
    salas: 'Salas',
    kills: 'Kills',
    puntos: 'Puntos',
    booyahs: 'Booyahs',
  },

  image: {
    bossLabel: 'BOOY',
    killsLabel: 'KILLS',
    rankLabel: 'RANK',
    totalLabel: 'TOTAL',
    mvp: 'MVP',
    moderator: 'MODERADOR',
    part: (a: number, b: number) => `Parte ${a}/${b}`,
    booyah: 'Booyah',
  },
} as const;
