import { MobileAds } from 'react-native-google-mobile-ads';

/**
 * Initialises AdMob with non-child-directed request configuration.
 * Must be called once at app startup before any ad is loaded.
 *
 * tagForChildDirectedTreatment: false — signals ads are NOT child-directed (COPPA)
 * tagForUnderAgeOfConsent: false      — signals user is NOT under age of consent (GDPR)
 * maxAdContentRating: 'T'            — caps ad content at Teen, matching the game's audience
 */
export function initializeAds(): Promise<void> {
  return MobileAds()
    .setRequestConfiguration({
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
      maxAdContentRating: 'T',
    })
    .then(() => MobileAds().initialize())
    .then(() => undefined);
}
