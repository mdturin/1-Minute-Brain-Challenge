export function canShowInterstitialNow() {
  return false;
}

export function showInterstitialWithCallbacks(onClosed?: () => void, _onFailed?: () => void) {
  onClosed?.();
}

export function showRewardedWithCallbacks(_onReward: () => void, _onClosed?: () => void, onFailed?: () => void) {
  onFailed?.();
}

export async function getDailyRewardedCount(): Promise<number> {
  return 0;
}

export async function incrementDailyRewardedCount(): Promise<void> {}

export async function canWatchRewardedToday(): Promise<boolean> {
  return false;
}

export const REWARDED_DAILY_LIMIT = 5;

