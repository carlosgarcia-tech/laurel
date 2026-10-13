import { prngFor } from './seed';

export interface HeadlineFacts {
  title: string;
  matchday: string;
  leader: { name: string; total: number; kills: number; booyahs: number };
  second: { name: string; total: number } | undefined;
  mvp: { name: string; kills: number; teamName: string } | undefined;
  rooms: number;
}

export interface Headline {
  title: string; // titular grande (hasta 2 líneas)
  lead: string; // 2–3 frases con hechos
  kicker: string; // una línea corta
}

/** Elige un patrón determinista con la semilla y rellena con datos reales. */
export function buildHeadline(facts: HeadlineFacts): Headline {
  const rnd = prngFor(
    `${facts.title}|${facts.matchday}|${facts.leader.name}|${facts.leader.total}`,
  );
  const tieAtTop = facts.second !== undefined && facts.second.total === facts.leader.total;
  const gapToSecond =
    facts.second !== undefined ? Math.abs(facts.leader.total - facts.second.total) : 0;

  const picks: string[] = [];
  if (tieAtTop && facts.second) {
    picks.push(`EMPATE EN LA CIMA ENTRE ${facts.leader.name} Y ${facts.second.name}`);
  } else {
    picks.push(
      `${facts.leader.name} MANDA EN LA JORNADA ${facts.matchday || 'ABIERTA'}`,
      `${facts.leader.name} SE IMPONE CON ${facts.leader.total} PUNTOS`,
      facts.second
        ? `${facts.leader.name} DOMINA; ${facts.second.name} A ${gapToSecond} PUNTOS`
        : `${facts.leader.name} DOMINA CON ${facts.leader.total} PUNTOS`,
      `${facts.leader.name} CIERRA ARRIBA CON ${facts.leader.total} PUNTOS`,
    );
  }
  const title = picks[Math.floor(rnd() * picks.length)] ?? 'RESULTADOS';

  const leadParts: string[] = [];
  if (facts.second && !tieAtTop) {
    leadParts.push(
      `${facts.leader.name} lidera con ${facts.leader.total} puntos; ${facts.second.name} queda a ${gapToSecond}.`,
    );
  } else if (tieAtTop && facts.second) {
    leadParts.push(
      `${facts.leader.name} y ${facts.second.name} empatan en lo más alto con ${facts.leader.total}.`,
    );
  } else {
    leadParts.push(`${facts.leader.name} encabeza la tabla con ${facts.leader.total} puntos.`);
  }
  if (facts.mvp) {
    leadParts.push(`${facts.mvp.name} (${facts.mvp.teamName}) aporta ${facts.mvp.kills} kills.`);
  }
  if (facts.leader.booyahs > 0) {
    leadParts.push(`Booyahs del líder: ${facts.leader.booyahs}.`);
  }
  if (facts.rooms > 1) leadParts.push(`Resultado acumulado de ${facts.rooms} salas.`);

  const kickerParts: string[] = [];
  if (facts.matchday) kickerParts.push(`Jornada ${facts.matchday}`);
  if (facts.mvp) kickerParts.push(`MVP: ${facts.mvp.name} · ${facts.mvp.kills} kills`);
  const kicker = kickerParts.join(' · ') || 'Resultados oficiales';

  return { title, lead: leadParts.join(' '), kicker };
}
