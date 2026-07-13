import { ETeamCode } from '../../../core/enums/team-code.enum';
import { Match, Player } from './badminton-club.models';

export function playersByTeam(match: Match, teamCode: ETeamCode): Player[] {
  return match.players.filter((item) => item.teamCode === teamCode).map((item) => item.player);
}

export function playerNames(players: Player[]): string {
  return players.map((player) => player.name).join(' / ');
}