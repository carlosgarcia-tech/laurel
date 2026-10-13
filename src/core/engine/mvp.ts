import type { PlayerStanding, ParsedRoom, TeamStanding } from '../types';
import { cleanDisplayName } from '../parser/normalize';

/** Número de jugadores en el top de MVP. */
export const MVP_SIZE = 3;

/** Top N de jugadores por kills acumuladas en todas las salas, agrupados por ID (no por nombre). */
export function computeMvp(
  rooms: readonly ParsedRoom[],
  standings: readonly TeamStanding[],
  max = MVP_SIZE,
): PlayerStanding[] {
  const teamNameByKey = new Map(standings.map((s) => [s.key, s.name]));
  const teamBestRankByKey = new Map(standings.map((s) => [s.key, s.bestRank]));

  interface Candidate extends PlayerStanding {
    /** Mejor rank logrado por el equipo del jugador (desempate del MVP). */
    teamBestRank: number;
    order: number;
  }

  const byId = new Map<string, Candidate>();
  let order = 0;

  for (const room of rooms) {
    for (const team of room.teams) {
      const teamBestRank = teamBestRankByKey.get(team.key) ?? Number.MAX_SAFE_INTEGER;
      const teamName = teamNameByKey.get(team.key) ?? team.name;
      for (const player of team.players) {
        order += 1;
        const existing = byId.get(player.id);
        if (existing) {
          existing.kills += player.kills;
        } else {
          byId.set(player.id, {
            id: player.id,
            name: player.name.length > 0 ? player.name : cleanDisplayName(player.name),
            teamName,
            teamKey: team.key,
            kills: player.kills,
            teamBestRank,
            order,
          });
        }
      }
    }
  }

  return [...byId.values()]
    .sort((a, b) => b.kills - a.kills || a.teamBestRank - b.teamBestRank || a.order - b.order)
    .slice(0, max)
    .map(({ id, name, teamName, teamKey, kills }) => ({ id, name, teamName, teamKey, kills }));
}
