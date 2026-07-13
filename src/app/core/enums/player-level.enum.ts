export enum EPlayerLevel {
  NEWBIE = 'NEWBIE',
  YEU = 'YEU',
  YEU_PLUS = 'YEU_PLUS',
  TBY_MINUS = 'TBY_MINUS',
  TBY = 'TBY',
  TBY_PLUS = 'TBY_PLUS',
  TBK = 'TBK',
  BAN_CHUYEN = 'BAN_CHUYEN',
  CHUYEN_NGHIEP = 'CHUYEN_NGHIEP',
}

export const PLAYER_LEVEL_LABELS: Record<EPlayerLevel, string> = {
  [EPlayerLevel.NEWBIE]: 'Newbie',
  [EPlayerLevel.YEU]: 'Yếu',
  [EPlayerLevel.YEU_PLUS]: 'Yếu +',
  [EPlayerLevel.TBY_MINUS]: 'Trung bình yếu -',
  [EPlayerLevel.TBY]: 'Trung bình yếu',
  [EPlayerLevel.TBY_PLUS]: 'Trung bình yếu +',
  [EPlayerLevel.TBK]: 'Trung bình khá',
  [EPlayerLevel.BAN_CHUYEN]: 'Bán chuyên',
  [EPlayerLevel.CHUYEN_NGHIEP]: 'Chuyên nghiệp',
};