import { beforeEach, describe, expect, it } from 'vitest';

import { LOCATION_STORAGE_KEY, readLocationChoice, writeLocationChoice } from './locationChoice';

describe('location choice persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores and restores a confirmed city', () => {
    writeLocationChoice(localStorage, 'Самара');

    expect(readLocationChoice(localStorage)).toEqual({ city: 'Самара', confirmed: true });
  });

  it('removes invalid local data', () => {
    localStorage.setItem(LOCATION_STORAGE_KEY, '{damaged');

    expect(readLocationChoice(localStorage)).toBeNull();
    expect(localStorage.getItem(LOCATION_STORAGE_KEY)).toBeNull();
  });
});
