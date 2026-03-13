/// <reference types="jest" />

import {
  MAX_ENERGY,
  REFILL_PER_HOUR,
  addEnergy,
  calculateRefilledEnergy,
  spendEnergy,
  type EnergyState,
} from './energy';

describe('energy logic', () => {
  const baseNow = 1_000_000;

  const makeState = (current: number, lastUpdatedAt: number = baseNow): EnergyState => ({
    current,
    lastUpdatedAt,
  });

  test('calculateRefilledEnergy caps at MAX_ENERGY and updates timestamp when already full', () => {
    const previous = makeState(MAX_ENERGY - 1, baseNow - 5 * 60 * 60 * 1000);
    const result = calculateRefilledEnergy(previous, baseNow);

    expect(result.current).toBeLessThanOrEqual(MAX_ENERGY);
    expect(result.lastUpdatedAt).toBeGreaterThanOrEqual(previous.lastUpdatedAt);
  });

  test('calculateRefilledEnergy does not change when now is before lastUpdatedAt', () => {
    const previous = makeState(10, baseNow);
    const result = calculateRefilledEnergy(previous, baseNow - 1_000);

    expect(result).toEqual(previous);
  });

  test('calculateRefilledEnergy increases energy according to elapsed time', () => {
    const previous = makeState(10, baseNow);
    const halfHourMs = (60 * 60 * 1000) / 2;
    const result = calculateRefilledEnergy(previous, baseNow + halfHourMs);

    // With current implementation, partial hours still contribute proportionally
    expect(result.current).toBeGreaterThan(previous.current);

    const twoAndHalfHoursMs = 2.5 * 60 * 60 * 1000;
    const later = calculateRefilledEnergy(previous, baseNow + twoAndHalfHoursMs);
    expect(later.current).toBeGreaterThan(result.current);
  });

  test('spendEnergy never drops below zero', () => {
    expect(spendEnergy(1, 'hard')).toBeGreaterThanOrEqual(0);
    expect(spendEnergy(0, 'easy')).toBe(0);
  });

  test('addEnergy ignores non-positive amounts', () => {
    expect(addEnergy(10, 0)).toBe(10);
    expect(addEnergy(10, -5)).toBe(10);
  });

  test('addEnergy caps at MAX_ENERGY', () => {
    const nearMax = MAX_ENERGY - 1;
    const result = addEnergy(nearMax, 10);
    expect(result).toBe(MAX_ENERGY);
  });
});

