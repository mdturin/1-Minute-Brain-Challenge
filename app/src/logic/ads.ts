// Universal fallback — Metro resolves ads.native.ts on native and ads.web.ts on web.
// This file is only used on platforms that are neither native nor web.
export {
  canShowInterstitialNow,
  showInterstitialWithCallbacks,
  showRewardedWithCallbacks,
  getDailyRewardedCount,
  incrementDailyRewardedCount,
  canWatchRewardedToday,
  REWARDED_DAILY_LIMIT,
} from './ads.web';
