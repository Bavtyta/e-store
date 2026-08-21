import { z } from 'zod';

export const LOCATION_STORAGE_KEY = 'storefront-location-v1';
export const LOCATION_SESSION_DISMISSED_KEY = 'storefront-location-prompt-dismissed';

export const AVAILABLE_CITIES = [
  'Тольятти',
  'Самара',
  'Сызрань',
  'Новокуйбышевск',
  'Другой город Самарской области',
] as const;

export type AvailableCity = (typeof AVAILABLE_CITIES)[number];

const locationChoiceSchema = z.strictObject({
  city: z.enum(AVAILABLE_CITIES),
  confirmed: z.literal(true),
});

export interface LocationChoice {
  city: AvailableCity;
  confirmed: true;
}

export function readLocationChoice(storage: Storage): LocationChoice | null {
  const storedValue = storage.getItem(LOCATION_STORAGE_KEY);

  if (storedValue === null) return null;

  try {
    const result = locationChoiceSchema.safeParse(JSON.parse(storedValue));

    if (result.success) return result.data;
  } catch {
    // Invalid local data is removed below and the safe default is used.
  }

  storage.removeItem(LOCATION_STORAGE_KEY);
  return null;
}

export function writeLocationChoice(storage: Storage, city: AvailableCity): void {
  storage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({ city, confirmed: true }));
}
