import type { Difficulty } from './difficulty';

export const MAX_ENERGY = 50;
export const REFILL_PER_HOUR = 10;

export const ENERGY_COST_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 2,
  medium: 5,
  hard: 10,
};

/** Energy granted per rewarded ad watch. */
export const REWARDED_AD_ENERGY_GRANT = 20;
/** Maximum rewarded ad watches per calendar day. */
export const REWARDED_AD_DAILY_LIMIT = 5;

export type EnergyState = {
  current: number;
  /**
   * Timestamp in milliseconds since epoch when energy was last updated.
   */
  lastUpdatedAt: number;
};

/**
 * Calculate a new EnergyState with refilled energy based on elapsed time.
 * Energy refills at REFILL_PER_HOUR up to MAX_ENERGY.
 */
export function calculateRefilledEnergy(previous: EnergyState, now: number): EnergyState {
  if (previous.current >= MAX_ENERGY) {
    return {
      current: MAX_ENERGY,
      lastUpdatedAt: now,
    };
  }

  if (now <= previous.lastUpdatedAt) {
    return previous;
  }

  const elapsedMs = now - previous.lastUpdatedAt;
  const hoursElapsed = elapsedMs / (60 * 60 * 1000);
  const refillAmount = Math.floor(hoursElapsed * REFILL_PER_HOUR);

  if (refillAmount <= 0) {
    return previous;
  }

  const nextCurrent = Math.min(MAX_ENERGY, previous.current + refillAmount);

  // Move lastUpdatedAt forward by the amount of whole hours we actually applied.
  const appliedMs = (refillAmount / REFILL_PER_HOUR) * 60 * 60 * 1000;
  const nextLastUpdatedAt = previous.lastUpdatedAt + appliedMs;

  return {
    current: nextCurrent,
    lastUpdatedAt: nextLastUpdatedAt,
  };
}

export function getCostForDifficulty(difficulty: Difficulty): number {
  return ENERGY_COST_BY_DIFFICULTY[difficulty];
}

export function canStartGame(currentEnergy: number, difficulty: Difficulty): boolean {
  const cost = getCostForDifficulty(difficulty);
  return currentEnergy >= cost;
}

export function spendEnergy(currentEnergy: number, difficulty: Difficulty): number {
  const cost = getCostForDifficulty(difficulty);
  return Math.max(0, currentEnergy - cost);
}

export function addEnergy(currentEnergy: number, amount: number): number {
  if (amount <= 0) {
    return currentEnergy;
  }
  return Math.min(MAX_ENERGY, currentEnergy + amount);
}


