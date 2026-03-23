export const USE_TEST_ADS = __DEV__;

const ANDROID_APP_ID = "ca-app-pub-1274854116614604~8487183739";
const ANDROID_BANNER_ID = "ca-app-pub-1274854116614604/3930857019";
const ANDROID_INTERSTITIAL_ID = "ca-app-pub-1274854116614604/1281644969";
const ANDROID_REWARDED_ID = "ca-app-pub-1274854116614604/1539697663";

type PlatformConfig = {
  appId: string;
  banner: string;
  interstitial: string;
  rewarded: string;
};

const androidConfig: PlatformConfig = {
  appId: ANDROID_APP_ID,
  banner: ANDROID_BANNER_ID,
  interstitial: ANDROID_INTERSTITIAL_ID,
  rewarded: ANDROID_REWARDED_ID,
};

export function getAdUnitIds() {
  const config = androidConfig;
  return {
    banner: config.banner,
    interstitial: config.interstitial,
    rewarded: config.rewarded,
  };
}
