import AsyncStorage from '@react-native-async-storage/async-storage';
import { EnergyState, MAX_ENERGY, calculateRefilledEnergy } from '../logic/energy';

const STORAGE_KEY = 'one-minute-brain-challenge/energy';

const createDefaultEnergyState = (now: number): EnergyState => ({
  current: MAX_ENERGY,
  lastUpdatedAt: now,
});

export async function loadEnergyState(now: number = Date.now()): Promise<EnergyState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultEnergyState(now);
    }
    const parsed = JSON.parse(raw) as Partial<EnergyState>;
    const base = createDefaultEnergyState(now);
    return {
      current: typeof parsed.current === 'number' ? parsed.current : base.current,
      lastUpdatedAt: typeof parsed.lastUpdatedAt === 'number' ? parsed.lastUpdatedAt : base.lastUpdatedAt,
    };
  } catch {
    return createDefaultEnergyState(now);
  }
}

export async function saveEnergyState(state: EnergyState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore persistence errors
  }
}

export async function loadAndRefillEnergy(now: number = Date.now()): Promise<EnergyState> {
  const current = await loadEnergyState(now);
  const next = calculateRefilledEnergy(current, now);
  if (next.current !== current.current || next.lastUpdatedAt !== current.lastUpdatedAt) {
    await saveEnergyState(next);
  }
  return next;
}

