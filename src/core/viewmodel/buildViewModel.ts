import type { EngineResult, ParsedRoom, PlayerStanding, TeamStanding } from '../types';
import { assignCodes } from './codes';
import { buildHeadline, type Headline } from './headline';
import { hashSeed } from './seed';

export interface StandingRow extends TeamStanding {
  position: number;
  code: string;
  gapToLeader: number;
  gapToPrev: number;
  shareOfLeader: number;
  colorIndex: number;
}

export interface VmRoom {
  label: string;
  fileName: string;
  kills: number;
  points: number;
  booyahTeam?: string;
}

export interface ResultViewModel {
  meta: {
    title: string;
    matchday: string;
    date: string;
    moderator: string;
    seed: number;
  };
  stats: { teams: number; rooms: number; kills: number; points: number; booyahs: number };
  standings: StandingRow[];
  podium: StandingRow[];
  rest: StandingRow[];
  mvp: Array<PlayerStanding & { position: number }>;
  rooms: VmRoom[];
  headline: Headline;
}

export interface ViewModelMetaInput {
  title: string;
  matchday: string;
  date: string;
  moderator: string;
}

/** Construye el ViewModel puro que todas las plantillas leen (sin lógica de negocio en ellas). */
export function buildViewModel(
  result: EngineResult,
  rooms: readonly ParsedRoom[],
  meta: ViewModelMetaInput,
): ResultViewModel {
  const leaderTotal = Math.max(1, result.standings[0]?.total ?? 1);
  const codes = assignCodes(
    result.standings,
    result.standings.map((team) => team.name),
  );

  const standings: StandingRow[] = result.standings.map((team, index) => {
    const previous = result.standings[index - 1];
    const gap = index === 0 ? 0 : Math.max(0, (previous?.total ?? 0) - team.total);
    return {
      ...team,
      position: index + 1,
      code: codes[index] ?? 'XXA',
      gapToLeader: gap,
      gapToPrev: gap,
      shareOfLeader: Math.min(1, Math.max(0, team.total / leaderTotal)),
      colorIndex: hashSeed(team.key) % 10,
    };
  });

  const roomSummaries: VmRoom[] = rooms.map((room, index) => {
    const kills = room.teams.reduce((acc, team) => acc + team.killScore, 0);
    const points = room.teams.reduce((acc, team) => acc + team.totalScore, 0);
    const winner = room.teams.find((team) => team.rank === 1);
    return {
      label: `Sala ${index + 1}`,
      fileName: room.fileName,
      kills,
      points,
      booyahTeam: winner?.name,
    };
  });

  const seed = hashSeed(`${meta.title.trim()}|${meta.matchday.trim()}|${meta.date.trim()}`);

  return {
    meta: { ...meta, seed },
    stats: { ...result.totals },
    standings,
    podium: standings.slice(0, 3),
    rest: standings.slice(3),
    mvp: result.mvp.map((player, index) => ({ ...player, position: index + 1 })),
    rooms: roomSummaries,
    headline: buildHeadline({
      title: meta.title.trim() || 'TORNEO',
      matchday: meta.matchday.trim(),
      leader: {
        name: standings[0]?.name ?? 'SIN EQUIPOS',
        total: standings[0]?.total ?? 0,
        kills: standings[0]?.kills ?? 0,
        booyahs: standings[0]?.booyahs ?? 0,
      },
      second:
        standings[1] !== undefined
          ? { name: standings[1].name, total: standings[1].total }
          : undefined,
      mvp:
        result.mvp[0] !== undefined
          ? {
              name: result.mvp[0].name,
              kills: result.mvp[0].kills,
              teamName: result.mvp[0].teamName,
            }
          : undefined,
      rooms: rooms.length,
    }),
  };
}
