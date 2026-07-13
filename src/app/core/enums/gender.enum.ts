export enum EGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export const GENDER_LABELS: Record<EGender, string> = {
  [EGender.MALE]: 'Nam',
  [EGender.FEMALE]: 'Nữ',
};