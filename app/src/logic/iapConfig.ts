export const IAP_PRODUCT_IDS = {
  monthly: 'com.oneminutebrain.challenge.unlimited_monthly',
  lifetime: 'com.oneminutebrain.challenge.unlimited_lifetime',
} as const;

export type IAPProductId = typeof IAP_PRODUCT_IDS[keyof typeof IAP_PRODUCT_IDS];
export type SubscriptionTier = 'monthly' | 'lifetime';
