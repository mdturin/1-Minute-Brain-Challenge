export const USE_TEST_ADS = __DEV__;

// Test IDs from Google AdMob documentation. Replace with real IDs for production.
const ANDROID_TEST_APP_ID = "ca-app-pub-1274854116614604~8487183739"; // done
const IOS_TEST_APP_ID = "ca-app-pub-3940256099942544~1458002511";

const ANDROID_TEST_BANNER_ID = "ca-app-pub-1274854116614604/3930857019"; // done
const ANDROID_TEST_INTERSTITIAL_ID = "ca-app-pub-1274854116614604/1281644969"; // done
const ANDROID_TEST_REWARDED_ID = "ca-app-pub-1274854116614604/1539697663"; // done

const IOS_TEST_BANNER_ID = "ca-app-pub-3940256099942544/2934735716";
const IOS_TEST_INTERSTITIAL_ID = "ca-app-pub-3940256099942544/4411468910";
const IOS_TEST_REWARDED_ID = "ca-app-pub-3940256099942544/1712485313";

type PlatformConfig = {
  appId: string;
  banner: string;
  interstitial: string;
  rewarded: string;
};

const androidConfig: PlatformConfig = {
  appId: ANDROID_TEST_APP_ID,
  banner: ANDROID_TEST_BANNER_ID,
  interstitial: ANDROID_TEST_INTERSTITIAL_ID,
  rewarded: ANDROID_TEST_REWARDED_ID,
};

const iosConfig: PlatformConfig = {
  appId: IOS_TEST_APP_ID,
  banner: IOS_TEST_BANNER_ID,
  interstitial: IOS_TEST_INTERSTITIAL_ID,
  rewarded: IOS_TEST_REWARDED_ID,
};

export function getAdUnitIds(platform: "android" | "ios") {
  const config = platform === "android" ? androidConfig : iosConfig;
  return {
    banner: config.banner,
    interstitial: config.interstitial,
    rewarded: config.rewarded,
  };
}
