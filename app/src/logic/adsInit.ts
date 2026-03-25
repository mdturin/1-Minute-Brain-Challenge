// Web / universal stub — AdMob is native-only.
// On Android/iOS Metro resolves adsInit.native.ts instead.
export function initializeAds(): Promise<void> {
  return Promise.resolve();
}
