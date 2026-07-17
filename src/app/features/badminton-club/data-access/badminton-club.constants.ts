import { BADMINTON_CLUB_TAB_LABELS, EBadmintonClubTab } from '../../../core/enums/badminton-club-tab.enum';
import { EGender } from '../../../core/enums/gender.enum';
import { EPlayerLevel } from '../../../core/enums/player-level.enum';
import { ClubTabItem, Player } from './badminton-club.models';

export const CLUB_TABS: ClubTabItem[] = [
  { id: EBadmintonClubTab.PLAYERS, label: BADMINTON_CLUB_TAB_LABELS[EBadmintonClubTab.PLAYERS], icon: 'user' },
  { id: EBadmintonClubTab.SCHEDULE, label: BADMINTON_CLUB_TAB_LABELS[EBadmintonClubTab.SCHEDULE], icon: 'shuttle' },
  { id: EBadmintonClubTab.HISTORY, label: BADMINTON_CLUB_TAB_LABELS[EBadmintonClubTab.HISTORY], icon: 'chart' },
];

export const PLAYER_LEVELS: EPlayerLevel[] = [
  EPlayerLevel.NEWBIE,
  EPlayerLevel.YEU,
  EPlayerLevel.YEU_PLUS,
  EPlayerLevel.TBY_MINUS,
  EPlayerLevel.TBY,
  EPlayerLevel.TBY_PLUS,
  EPlayerLevel.TBK,
  EPlayerLevel.BAN_CHUYEN,
  EPlayerLevel.CHUYEN_NGHIEP,
];

export const COURT_OPTIONS = [1, 2];

export const EMPTY_PLAYER_FORM: Player = {
  playerCode: '',
  name: '',
  gender: EGender.MALE,
  level: EPlayerLevel.NEWBIE,
};