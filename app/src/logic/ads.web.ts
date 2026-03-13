export function canShowInterstitialNow() {
  return false;
}

export function showInterstitialWithCallbacks(onClosed?: () => void, _onFailed?: () => void) {
  onClosed?.();
}

export function showRewardedWithCallbacks(_onReward: () => void, _onClosed?: () => void, onFailed?: () => void) {
  onFailed?.();
}

