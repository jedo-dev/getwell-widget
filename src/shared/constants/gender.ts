/**
 * Пол (для клиента и питомца)
 */
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

/**
 * Лейблы для пола клиента
 */
export const GENDER_LABELS: Record<Gender, string> = {
  [Gender.MALE]: 'Мужчина',
  [Gender.FEMALE]: 'Женщина',
};

/**
 * Лейблы для пола питомца
 */
export const PET_GENDER_LABELS: Record<Gender, string> = {
  [Gender.MALE]: 'Самец',
  [Gender.FEMALE]: 'Самка',
};

