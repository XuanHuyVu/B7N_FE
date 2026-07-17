import { EBadmintonClubTab } from '../../../core/enums/badminton-club-tab.enum';
import { EGender } from '../../../core/enums/gender.enum';
import { EPlayerLevel } from '../../../core/enums/player-level.enum';
import { ETeamCode } from '../../../core/enums/team-code.enum';

export interface ApiResponse<T> {
  data: T;
}

export interface Player {
  playerCode: string;
  name: string;
  gender: EGender;
  level: EPlayerLevel;
  levelScore?: number;
}

export interface PlaySessionSummary {
  sessionCode: string;
  courtCount: number;
  status: string;
  createdAt: string;
}

export interface SessionResponse {
  session: PlaySessionSummary;
}

export interface RoundInfo {
  sessionCode: string;
  roundNumber: number;
  status: string;
  createdAt: string;
}

export interface MatchPlayer {
  player: Player;
  teamCode: ETeamCode;
}

export interface Match {
  sessionCode: string;
  roundNumber: number;
  courtNumber: number;
  status: string;
  totalScoreA: number;
  totalScoreB: number;
  scoreDifference: number;
  winner?: ETeamCode;
  players: MatchPlayer[];
}

export interface RoundResponse {
  round: RoundInfo;
  matches: Match[];
  restingPlayers: Array<{ player: Player }>;
}

export interface MatchHistory {
  id: string;
  sessionCode: string;
  playedAt: string;
  roundNumber: number;
  courtNumber: number;
  winner: ETeamCode;
  teamA: Player[];
  teamB: Player[];
}

export interface RankingRow {
  player: Player;
  matches: number;
  wins: number;
  winRate: number;
}

export interface HistoryResponse {
  history: MatchHistory[];
}

export interface RankingResponse {
  ranking: RankingRow[];
}

export interface SessionPlayerStat {
  player: Player;
  matchCount: number;
  restCount: number;
  consecutiveMatchCount: number;
}

export interface SessionStatsResponse {
  sessionCode: string;
  players: SessionPlayerStat[];
}

export interface PlaySessionStateResponse {
  session: PlaySessionSummary;
  currentRound: RoundResponse | null;
  players: SessionPlayerStat[];
}

export interface HistoryGroup {
  date: string;
  items: MatchHistory[];
}

export interface ClubTabItem {
  id: EBadmintonClubTab;
  label: string;
  icon: 'user' | 'shuttle' | 'chart';
}