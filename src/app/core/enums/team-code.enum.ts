export enum ETeamCode {
  A = 'A',
  B = 'B',
}

export const TEAM_CODE_LABELS: Record<ETeamCode, string> = {
  [ETeamCode.A]: 'Đội trái',
  [ETeamCode.B]: 'Đội phải',
};