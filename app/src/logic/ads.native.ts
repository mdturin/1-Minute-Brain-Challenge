import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AdEventType,
  InterstitialAd,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { getAdUnitIds } from './adsConfig';

const platformKey = Platform.OS === 'android' ? 'android' : 'ios';

const { interstitial, rewarded } = getAdUnitIds(platformKey);

const interstitialUnitId = __DEV__ ? TestIds.INTERSTITIAL : interstitial;
const rewardedUnitId = __DEV__ ? TestIds.REWARDED : rewarded;

let lastInterstitialShownAt: number | null = null;
const INTERSTITIAL_MIN_INTERVAL_MS = 60 * 1000; // 1 minute between interstitials

// ── Daily rewarded ad limit ───────────────────────────────────────────────────
const REWARDED_DAILY_KEY = 'rewardedAdDailyCount';
const REWARDED_DAILY_LIMIT = 5;

type RewardedDailyRecord = { date: string; count: number };

function todayString(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

export async function getDailyRewardedCount(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(REWARDED_DAILY_KEY);
    if (!raw) return 0;
    const record: RewardedDailyRecord = JSON.parse(raw);
    if (record.date !== todayString()) return 0;
    return record.count;
  } catch {
    return 0;
  }
}

export async function incrementDailyRewardedCount(): Promise<void> {
  try {
    const today = todayString();
    const raw = await AsyncStorage.getItem(REWARDED_DAILY_KEY);
    let record: RewardedDailyRecord = { date: today, count: 0 };
    if (raw) {
      const parsed: RewardedDailyRecord = JSON.parse(raw);
      record = parsed.date === today ? parsed : { date: today, count: 0 };
    }
    await AsyncStorage.setItem(REWARDED_DAILY_KEY, JSON.stringify({ date: today, count: record.count + 1 }));
  } catch {
    // silently fail
  }
}

export async function canWatchRewardedToday(): Promise<boolean> {
  const count = await getDailyRewardedCount();
  return count < REWARDED_DAILY_LIMIT;
}

export { REWARDED_DAILY_LIMIT };

export function canShowInterstitialNow() {
  if (!lastInterstitialShownAt) {
    return true;
  }
  return Date.now() - lastInterstitialShownAt >= INTERSTITIAL_MIN_INTERVAL_MS;
}

export function loadInterstitial() {
  return InterstitialAd.createForAdRequest(interstitialUnitId);
}

export function loadRewarded() {
  return RewardedAd.createForAdRequest(rewardedUnitId);
}

export function showInterstitialWithCallbacks(onClosed?: () => void, onFailed?: () => void) {
  const ad = loadInterstitial();

  const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
    ad.show().catch(() => {
      unsubscribeLoaded();
      onFailed?.();
    });
  });

  const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
    lastInterstitialShownAt = Date.now();
    unsubscribeLoaded();
    unsubscribeClosed();
    unsubscribeError();
    onClosed?.();
  });

  const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, () => {
    unsubscribeLoaded();
    unsubscribeClosed();
    unsubscribeError();
    onFailed?.();
  });

  ad.load();
}

export function showRewardedWithCallbacks(onReward: () => void, onClosed?: () => void, onFailed?: () => void) {
  const ad = loadRewarded();

  const unsubscribeLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
    ad.show().catch(() => {
      unsubscribeLoaded();
      onFailed?.();
    });
  });

  const unsubscribeReward = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
    void incrementDailyRewardedCount();
    onReward();
  });

  const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
    unsubscribeLoaded();
    unsubscribeReward();
    unsubscribeClosed();
    unsubscribeError();
    onClosed?.();
  });

  const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, () => {
    unsubscribeLoaded();
    unsubscribeReward();
    unsubscribeClosed();
    unsubscribeError();
    onFailed?.();
  });

  ad.load();
}

