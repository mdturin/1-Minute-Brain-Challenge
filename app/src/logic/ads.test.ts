/// <reference types="jest" />

// Mock AsyncStorage before importing the ads module
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock react-native-google-mobile-ads
jest.mock('react-native-google-mobile-ads', () => ({
  AdEventType: { LOADED: 'loaded', CLOSED: 'closed', ERROR: 'error' },
  RewardedAdEventType: { LOADED: 'loaded', EARNED_REWARD: 'earned_reward' },
  InterstitialAd: { createForAdRequest: jest.fn() },
  RewardedAd: { createForAdRequest: jest.fn() },
  TestIds: { INTERSTITIAL: 'test-interstitial', REWARDED: 'test-rewarded' },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

// Import after mocks are set up
import {
  canShowInterstitialNow,
  getDailyRewardedCount,
  canWatchRewardedToday,
  REWARDED_DAILY_LIMIT,
} from './ads.native';

const mockGetItem = AsyncStorage.getItem as jest.Mock;
const mockSetItem = AsyncStorage.setItem as jest.Mock;

const TODAY = new Date().toISOString().slice(0, 10);

describe('canShowInterstitialNow', () => {
  test('returns true when no interstitial has been shown yet', () => {
    expect(canShowInterstitialNow()).toBe(true);
  });
});

describe('getDailyRewardedCount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns 0 when no record exists', async () => {
    mockGetItem.mockResolvedValueOnce(null);
    const count = await getDailyRewardedCount();
    expect(count).toBe(0);
  });

  test('returns 0 when stored date is a previous day', async () => {
    mockGetItem.mockResolvedValueOnce(
      JSON.stringify({ date: '2020-01-01', count: 5 })
    );
    const count = await getDailyRewardedCount();
    expect(count).toBe(0);
  });

  test('returns stored count when date matches today', async () => {
    mockGetItem.mockResolvedValueOnce(
      JSON.stringify({ date: TODAY, count: 3 })
    );
    const count = await getDailyRewardedCount();
    expect(count).toBe(3);
  });

  test('returns 0 on AsyncStorage error', async () => {
    mockGetItem.mockRejectedValueOnce(new Error('storage error'));
    const count = await getDailyRewardedCount();
    expect(count).toBe(0);
  });
});

describe('canWatchRewardedToday', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns true when count is below daily limit', async () => {
    mockGetItem.mockResolvedValueOnce(
      JSON.stringify({ date: TODAY, count: REWARDED_DAILY_LIMIT - 1 })
    );
    expect(await canWatchRewardedToday()).toBe(true);
  });

  test('returns false when daily limit is reached', async () => {
    mockGetItem.mockResolvedValueOnce(
      JSON.stringify({ date: TODAY, count: REWARDED_DAILY_LIMIT })
    );
    expect(await canWatchRewardedToday()).toBe(false);
  });

  test('returns true on a fresh day (previous day stored)', async () => {
    mockGetItem.mockResolvedValueOnce(
      JSON.stringify({ date: '2020-01-01', count: REWARDED_DAILY_LIMIT })
    );
    expect(await canWatchRewardedToday()).toBe(true);
  });
});

describe('REWARDED_DAILY_LIMIT', () => {
  test('is a positive integer', () => {
    expect(REWARDED_DAILY_LIMIT).toBeGreaterThan(0);
    expect(Number.isInteger(REWARDED_DAILY_LIMIT)).toBe(true);
  });
});
