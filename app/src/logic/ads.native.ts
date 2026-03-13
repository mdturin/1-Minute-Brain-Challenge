import { Platform } from 'react-native';
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
const INTERSTITIAL_MIN_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes between interstitials

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

