import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'one-minute-brain-challenge/stats';

export type GameStats = {
  bestScore: number;
  gamesPlayed: number;
  totalScore: number;
  bestStreak: number;
};

const defaultStats: GameStats = {
  bestScore: 0,
  gamesPlayed: 0,
  totalScore: 0,
  bestStreak: 0,
};

export async function loadStats(): Promise<GameStats> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultStats;
    }
    const parsed = JSON.parse(raw) as GameStats;
    return {
      ...defaultStats,
      ...parsed,
    };
  } catch {
    return defaultStats;
  }
}

export async function updateStats(params: { lastScore: number; lastMaxStreak: number }): Promise<void> {
  const current = await loadStats();
  const next: GameStats = {
    bestScore: Math.max(current.bestScore, params.lastScore),
    gamesPlayed: current.gamesPlayed + 1,
    totalScore: current.totalScore + params.lastScore,
    bestStreak: Math.max(current.bestStreak, params.lastMaxStreak),
  };

  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore persistence errors in gameplay
  }
}

