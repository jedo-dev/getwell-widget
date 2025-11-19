/**
 * Виды питомцев
 */
export enum PetSpecies {
  DOG = 'dog',
  CAT = 'cat',
  BIRD = 'bird',
  RODENT = 'rodent',
  OTHER = 'other',
}

/**
 * Лейблы для видов питомцев
 */
export const PET_SPECIES_LABELS: Record<PetSpecies, string> = {
  [PetSpecies.DOG]: 'Собака',
  [PetSpecies.CAT]: 'Кошка',
  [PetSpecies.BIRD]: 'Птица',
  [PetSpecies.RODENT]: 'Грызун',
  [PetSpecies.OTHER]: 'Другое',
};

/**
 * Опции для селекта видов питомцев
 */
export const PET_SPECIES_OPTIONS = Object.entries(PET_SPECIES_LABELS).map(([value, label]) => ({
  value,
  label,
}));

