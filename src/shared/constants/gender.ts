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
 * Лейблы для пола питомца (дефолтные значения, используются только в офлайн режиме)
 */
export const PET_GENDER_LABELS: Record<Gender, string> = {
  [Gender.MALE]: 'Самец',
  [Gender.FEMALE]: 'Самка',
};

