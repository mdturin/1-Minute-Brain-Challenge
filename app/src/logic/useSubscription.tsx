import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';
import { useIAP } from 'expo-iap';
import type { Product, ProductSubscription, Purchase } from 'expo-iap';
import {
  IAP_PRODUCT_IDS,
  type IAPProductId,
  type SubscriptionTier,
} from './iapConfig';
import {
  loadSubscriptionStatus,
  saveSubscriptionStatus,
} from '../storage/subscription';

type SubscriptionContextValue = {
  isSubscribed: boolean;
  subscriptionTier: SubscriptionTier | null;
  isLoading: boolean;
  monthlyProduct: ProductSubscription | null;
  lifetimeProduct: Product | null;
  purchase: (productId: IAPProductId) => Promise<void>;
  restore: () => Promise<void>;
  isRestoring: boolean;
  deepLinkManage: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextValue>({
  isSubscribed: false,
  subscriptionTier: null,
  isLoading: true,
  monthlyProduct: null,
  lifetimeProduct: null,
  purchase: async () => {},
  restore: async () => {},
  isRestoring: false,
  deepLinkManage: async () => {},
});

export function useSubscription(): SubscriptionContextValue {
  return useContext(SubscriptionContext);
}

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] =
    useState<SubscriptionTier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);

  const processingPurchaseRef = useRef(false);

  const {
    connected,
    subscriptions,
    products,
    availablePurchases,
    fetchProducts,
    requestPurchase,
    finishTransaction,
    getAvailablePurchases,
    restorePurchases,
    hasActiveSubscriptions,
  } = useIAP({
    onPurchaseSuccess: async (purchase: Purchase) => {
      if (processingPurchaseRef.current) return;
      processingPurchaseRef.current = true;
      try {
        const isMonthly = purchase.productId === IAP_PRODUCT_IDS.monthly;
        const isLifetime = purchase.productId === IAP_PRODUCT_IDS.lifetime;
        if (!isMonthly && !isLifetime) return;

        const tier: SubscriptionTier = isLifetime ? 'lifetime' : 'monthly';
        const status = {
          isActive: true,
          tier,
          purchaseToken: purchase.purchaseToken ?? purchase.transactionId ?? null,
          expiresAt: null as number | null,
          platform: Platform.OS === 'ios' ? 'ios' as const : 'android' as const,
          updatedAt: Date.now(),
        };
        await saveSubscriptionStatus(status);
        setIsSubscribed(true);
        setSubscriptionTier(tier);
        await finishTransaction({ purchase, isConsumable: false });
      } catch (err) {
        console.error('Error processing purchase:', err);
      } finally {
        processingPurchaseRef.current = false;
      }
    },
    onPurchaseError: (error) => {
      // User cancellation is not an error worth logging
      if (error.code !== 'user-cancelled') {
        console.warn('IAP purchase error:', error.code, error.message);
      }
    },
  });

  // Load cached subscription status on mount (instant, no IAP call)
  useEffect(() => {
    let cancelled = false;
    loadSubscriptionStatus().then((status) => {
      if (cancelled) return;
      if (status.isActive) {
        setIsSubscribed(true);
        setSubscriptionTier(status.tier);
      }
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Once connected, fetch products and reconcile purchase history
  useEffect(() => {
    if (!connected) return;

    const reconcile = async () => {
      try {
        // Fetch product info for price display
        await fetchProducts({
          skus: [IAP_PRODUCT_IDS.monthly],
          type: 'subs',
        });
        await fetchProducts({
          skus: [IAP_PRODUCT_IDS.lifetime],
          type: 'in-app',
        });

        // Check active subscriptions on the store (authoritative)
        const hasActive = await hasActiveSubscriptions([IAP_PRODUCT_IDS.monthly]);
        if (hasActive) {
          setIsSubscribed(true);
          setSubscriptionTier('monthly');
          await saveSubscriptionStatus({
            isActive: true,
            tier: 'monthly',
            purchaseToken: null,
            expiresAt: null,
            platform: Platform.OS === 'ios' ? 'ios' : 'android',
            updatedAt: Date.now(),
          });
          return;
        }

        // Check for lifetime purchase in available purchases
        await getAvailablePurchases();
        // availablePurchases state updates asynchronously; handled in the effect below
      } catch (err) {
        console.warn('IAP reconcile error:', err);
      }
    };

    void reconcile();
  }, [connected]);

  // Check availablePurchases for lifetime product after reconcile
  useEffect(() => {
    if (availablePurchases.length === 0) return;
    const lifetimePurchase = availablePurchases.find(
      (p) => p.productId === IAP_PRODUCT_IDS.lifetime,
    );
    if (lifetimePurchase) {
      setIsSubscribed(true);
      setSubscriptionTier('lifetime');
      void saveSubscriptionStatus({
        isActive: true,
        tier: 'lifetime',
        purchaseToken:
          lifetimePurchase.purchaseToken ??
          lifetimePurchase.transactionId ??
          null,
        expiresAt: null,
        platform: Platform.OS === 'ios' ? 'ios' : 'android',
        updatedAt: Date.now(),
      });
    }
  }, [availablePurchases]);

  const purchase = useCallback(
    async (productId: IAPProductId) => {
      const isSubscription = productId === IAP_PRODUCT_IDS.monthly;
      await requestPurchase({
        request: {
          apple: { sku: productId },
          google: isSubscription
            ? { skus: [productId] }
            : { skus: [productId] },
        },
        type: isSubscription ? 'subs' : 'in-app',
      });
    },
    [requestPurchase],
  );

  const restore = useCallback(async () => {
    setIsRestoring(true);
    try {
      await restorePurchases();
      await getAvailablePurchases();
      // availablePurchases effect handles updating state
    } catch (err) {
      console.warn('Restore purchases error:', err);
    } finally {
      setIsRestoring(false);
    }
  }, [restorePurchases, getAvailablePurchases]);

  const deepLinkManage = useCallback(async () => {
    try {
      const { deepLinkToSubscriptions } = await import('expo-iap');
      await deepLinkToSubscriptions({
        skuAndroid: IAP_PRODUCT_IDS.monthly,
        packageNameAndroid: 'com.oneminutebrain.challenge',
      });
    } catch (err) {
      console.warn('deepLinkToSubscriptions error:', err);
    }
  }, []);

  // Find monthly product from subscriptions state
  const monthlyProduct =
    subscriptions.find((s) => s.productId === IAP_PRODUCT_IDS.monthly) ?? null;

  // Find lifetime product from products state
  const lifetimeProduct =
    products.find((p) => p.productId === IAP_PRODUCT_IDS.lifetime) ?? null;

  return (
    <SubscriptionContext.Provider
      value={{
        isSubscribed,
        subscriptionTier,
        isLoading,
        monthlyProduct,
        lifetimeProduct,
        purchase,
        restore,
        isRestoring,
        deepLinkManage,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}
