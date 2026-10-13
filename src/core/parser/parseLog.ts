import type { ParseWarning, ParsedRoom, PlayerEntry, TeamEntry } from '../types';
import { cleanDisplayName, normalizeTeamKey } from './normalize';

/**
 * Parser de archivos de resultados (una línea por equipo seguida de sus jugadores).
 * Ver AGENTS.md §4: procesa línea a línea, nunca lanza por contenido inválido;
 * acumula advertencias con número de línea.
 */

const TEAM_RE =
  /^TeamName:\s*(.+?)\s+Rank:\s*(\d+)\s+KillScore:\s*(\d+)\s+RankScore:\s*(\d+)\s+TotalScore:\s*(\d+)$/;
const PLAYER_RE = /^NAME:\s*(.+?)\s+ID:\s*(\d+)\s+KILL:\s*(\d+)$/;

/** Convierte un grupo de captura en número. Los patrones ya garantizan dígitos. */
function toInt(group: string | undefined): number {
  const value = Number.parseInt(group ?? '', 10);
  return Number.isNaN(value) ? 0 : value;
}

export function parseLog(text: string, fileName: string): ParsedRoom {
  const warnings: ParseWarning[] = [];
  const withoutBom = text.replace(/^\uFEFF/, '');
  const lines = withoutBom.split(/\r?\n/);

  const teams: TeamEntry[] = [];
  const teamLineNumbers: number[] = [];
  let currentTeam: number | undefined;

  for (const [index, raw] of lines.entries()) {
    const line = raw.trim();
    if (line.length === 0) continue;
    const lineNumber = index + 1;

    const teamMatch = TEAM_RE.exec(line);
    if (teamMatch) {
      const name = cleanDisplayName(teamMatch[1] ?? '');
      teams.push({
        name,
        key: normalizeTeamKey(teamMatch[1] ?? ''),
        rank: toInt(teamMatch[2]),
        killScore: toInt(teamMatch[3]),
        rankScore: toInt(teamMatch[4]),
        totalScore: toInt(teamMatch[5]),
        players: [],
      });
      teamLineNumbers.push(lineNumber);
      currentTeam = teams.length - 1;
      continue;
    }

    const playerMatch = PLAYER_RE.exec(line);
    if (playerMatch) {
      if (currentTeam === undefined) {
        warnings.push({
          line: lineNumber,
          message: 'Jugador antes del primer equipo; se ignora.',
        });
        continue;
      }
      const player: PlayerEntry = {
        name: cleanDisplayName(playerMatch[1] ?? ''),
        id: (playerMatch[2] ?? '').trim(),
        kills: toInt(playerMatch[3]),
      };
      const team = teams[currentTeam];
      if (team) team.players.push(player);
      continue;
    }

    warnings.push({
      line: lineNumber,
      message: 'Línea no reconocida; no coincide con equipo ni jugador, se ignora.',
    });
  }

  // Validaciones de consistencia (no fatales, solo advertencias visibles).
  for (const [index, team] of teams.entries()) {
    const lineNumber = teamLineNumbers[index] ?? 0;
    if (team.totalScore !== team.killScore + team.rankScore) {
      warnings.push({
        line: lineNumber,
        message: `TotalScore (${team.totalScore}) no es igual a KillScore + RankScore (${team.killScore} + ${team.rankScore}) en "${team.name}".`,
      });
    }
    if (team.players.length === 0) {
      warnings.push({
        line: lineNumber,
        message: `Equipo "${team.name}" no tiene jugadores registrados.`,
      });
      continue;
    }
    const playerKills = team.players.reduce((acc, player) => acc + player.kills, 0);
    if (playerKills !== team.killScore) {
      warnings.push({
        line: lineNumber,
        message: `KillScore (${team.killScore}) no coincide con la suma de kills de sus jugadores (${playerKills}) en "${team.name}".`,
      });
    }
  }

  return { fileName, teams, warnings };
}
