import { useCallback, useEffect, useState } from 'react';
import type { Difficulty } from './difficulty';
import { MAX_ENERGY, addEnergy, canStartGame, spendEnergy } from './energy';
import { loadAndRefillEnergy, saveEnergyState } from '../storage/energy';

type UseEnergyResult = {
  energy: number;
  maxEnergy: number;
  isLoading: boolean;
  refreshEnergy: () => Promise<void>;
  spendForDifficulty: (difficulty: Difficulty) => Promise<{ success: boolean; reason?: 'insufficient' | 'error' }>;
  grantEnergy: (amount: number) => Promise<void>;
};

export function useEnergy(): UseEnergyResult {
  const [energy, setEnergy] = useState<number>(MAX_ENERGY);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshEnergy = useCallback(async () => {
    setIsLoading(true);
    try {
      const state = await loadAndRefillEnergy(Date.now());
      setEnergy(state.current);
    } catch (error) {
      console.error("Error loading energy:", error);
      setEnergy(MAX_ENERGY); // fallback to max on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshEnergy();
  }, [refreshEnergy]);

  const spendForDifficulty = useCallback(
    async (difficulty: Difficulty) => {
      try {
        const state = await loadAndRefillEnergy(Date.now());

        if (!canStartGame(state.current, difficulty)) {
          setEnergy(state.current);
          return { success: false, reason: 'insufficient' as const };
        }

        const nextCurrent = spendEnergy(state.current, difficulty);
        const nextState = {
          ...state,
          current: nextCurrent,
          lastUpdatedAt: Date.now(),
        };

        setEnergy(nextCurrent);
        await saveEnergyState(nextState);

        return { success: true as const };
      } catch {
        return { success: false as const, reason: 'error' as const };
      }
    },
    []
  );

  const grantEnergy = useCallback(async (amount: number) => {
    if (amount <= 0) {
      return;
    }
    try {
      const state = await loadAndRefillEnergy(Date.now());
      const nextCurrent = addEnergy(state.current, amount);
      const nextState = {
        ...state,
        current: nextCurrent,
        lastUpdatedAt: Date.now(),
      };
      setEnergy(nextCurrent);
      await saveEnergyState(nextState);
    } catch {
      // ignore errors; user just doesn't get the bonus
    }
  }, []);

  return {
    energy,
    maxEnergy: MAX_ENERGY,
    isLoading,
    refreshEnergy,
    spendForDifficulty,
    grantEnergy,
  };
}

