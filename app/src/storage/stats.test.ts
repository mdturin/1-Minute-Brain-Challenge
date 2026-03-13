/// <reference types="jest" />

import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadStats, updateStats, type GameStats } from './stats';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

const mockedStorage = AsyncStorage as unknown as {
  getItem: jest.Mock;
  setItem: jest.Mock;
};

describe('stats storage', () => {
  beforeEach(() => {
    mockedStorage.getItem.mockReset();
    mockedStorage.setItem.mockReset();
  });

  test('loadStats returns defaults when nothing stored', async () => {
    mockedStorage.getItem.mockResolvedValueOnce(null);
    const stats = await loadStats();

    expect(stats.bestScore).toBe(0);
    expect(stats.gamesPlayed).toBe(0);
  });

  test('loadStats merges stored values with defaults', async () => {
    const partial: Partial<GameStats> = { bestScore: 10 };
    mockedStorage.getItem.mockResolvedValueOnce(JSON.stringify(partial));

    const stats = await loadStats();
    expect(stats.bestScore).toBe(10);
    expect(stats.gamesPlayed).toBe(0);
  });

  test('updateStats bumps counters and bests', async () => {
    const current: GameStats = {
      bestScore: 20,
      gamesPlayed: 3,
      totalScore: 50,
      bestStreak: 4,
    };
    mockedStorage.getItem.mockResolvedValueOnce(JSON.stringify(current));

    await updateStats({ lastScore: 30, lastMaxStreak: 5 });

    expect(mockedStorage.setItem).toHaveBeenCalled();
    const [, payload] = mockedStorage.setItem.mock.calls[0];
    const next = JSON.parse(payload) as GameStats;
    expect(next.bestScore).toBe(30);
    expect(next.gamesPlayed).toBe(4);
    expect(next.totalScore).toBe(80);
    expect(next.bestStreak).toBe(5);
  });
});

