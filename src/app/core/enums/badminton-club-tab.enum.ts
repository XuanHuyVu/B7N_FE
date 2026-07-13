export enum EBadmintonClubTab {
  PLAYERS = 'players',
  SCHEDULE = 'schedule',
  HISTORY = 'history',
}

export const BADMINTON_CLUB_TAB_LABELS: Record<EBadmintonClubTab, string> = {
  [EBadmintonClubTab.PLAYERS]: 'Người chơi',
  [EBadmintonClubTab.SCHEDULE]: 'Xếp trận',
  [EBadmintonClubTab.HISTORY]: 'Lịch sử & Thống kê',
};