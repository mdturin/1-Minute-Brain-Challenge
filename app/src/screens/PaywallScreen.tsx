import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';
import { useSubscription } from '../logic/useSubscription';
import { IAP_PRODUCT_IDS } from '../logic/iapConfig';

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

const FEATURES = [
  { icon: 'infinite-outline' as const, text: 'Unlimited plays — no energy cost' },
  { icon: 'timer-outline' as const, text: 'No energy wait timers' },
  { icon: 'trophy-outline' as const, text: 'Crown badge on your profile' },
];

export default function PaywallScreen({ navigation }: Props) {
  const {
    isSubscribed,
    monthlyProduct,
    lifetimeProduct,
    purchase,
    restore,
    isRestoring,
  } = useSubscription();

  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);

  // Auto-close when subscription becomes active
  useEffect(() => {
    if (isSubscribed) {
      navigation.goBack();
    }
  }, [isSubscribed, navigation]);

  const handlePurchase = async (productId: string) => {
    setIsPurchasing(productId);
    try {
      await purchase(productId as typeof IAP_PRODUCT_IDS[keyof typeof IAP_PRODUCT_IDS]);
    } catch {
      Alert.alert('Purchase failed', 'Please try again.');
    } finally {
      setIsPurchasing(null);
    }
  };

  const monthlyPrice = monthlyProduct
    ? ('localizedPrice' in monthlyProduct
        ? monthlyProduct.localizedPrice
        : null)
    : null;

  const lifetimePrice = lifetimeProduct
    ? ('localizedPrice' in lifetimeProduct
        ? lifetimeProduct.localizedPrice
        : null)
    : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Close button */}
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={24} color="#64748b" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.crownCircle}>
            <Ionicons name="star" size={40} color="#eab308" />
          </View>
          <Text style={styles.title}>Unlimited Energy</Text>
          <Text style={styles.subtitle}>Play without limits</Text>
        </View>

        {/* Feature list */}
        <View style={styles.featureList}>
          {FEATURES.map((f) => (
            <View key={f.text} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon} size={18} color="#a5b4fc" />
              </View>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Monthly card */}
        <View style={styles.cardHighlight}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Monthly</Text>
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>MOST POPULAR</Text>
            </View>
          </View>
          <Text style={styles.priceText}>
            {monthlyPrice ?? '—'}{monthlyPrice ? ' / month' : ''}
          </Text>
          <Text style={styles.cardSubtext}>Cancel anytime</Text>
          <TouchableOpacity
            style={[styles.primaryButton, (!monthlyProduct || isPurchasing !== null) && styles.buttonDisabled]}
            onPress={() => handlePurchase(IAP_PRODUCT_IDS.monthly)}
            disabled={!monthlyProduct || isPurchasing !== null}
            activeOpacity={0.85}
          >
            {isPurchasing === IAP_PRODUCT_IDS.monthly ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Subscribe Monthly</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Lifetime card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Lifetime</Text>
          <Text style={styles.priceText}>
            {lifetimePrice ?? '—'}
          </Text>
          <Text style={styles.cardSubtext}>Pay once, own forever</Text>
          <TouchableOpacity
            style={[styles.secondaryButton, (!lifetimeProduct || isPurchasing !== null) && styles.buttonDisabled]}
            onPress={() => handlePurchase(IAP_PRODUCT_IDS.lifetime)}
            disabled={!lifetimeProduct || isPurchasing !== null}
            activeOpacity={0.85}
          >
            {isPurchasing === IAP_PRODUCT_IDS.lifetime ? (
              <ActivityIndicator color="#a5b4fc" size="small" />
            ) : (
              <Text style={styles.secondaryButtonText}>Buy Lifetime</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Restore */}
        <TouchableOpacity
          style={styles.restoreRow}
          onPress={restore}
          disabled={isRestoring}
        >
          {isRestoring ? (
            <ActivityIndicator size="small" color="#64748b" />
          ) : (
            <Text style={styles.restoreText}>Restore Purchases</Text>
          )}
        </TouchableOpacity>

        {/* Legal */}
        <Text style={styles.legal}>
          Subscription automatically renews unless cancelled at least 24 hours before the end of the current period. Manage or cancel in your device settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050816',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 12,
  },
  crownCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(234,179,8,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(234,179,8,0.3)',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f9fafb',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
  },
  featureList: {
    width: '100%',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(165,180,252,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#e2e8f0',
    fontWeight: '500',
    flex: 1,
  },
  cardHighlight: {
    width: '100%',
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#6366f1',
  },
  card: {
    width: '100%',
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f9fafb',
  },
  popularBadge: {
    backgroundColor: 'rgba(99,102,241,0.2)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  popularText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#a5b4fc',
    letterSpacing: 0.5,
  },
  priceText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f9fafb',
    marginBottom: 4,
  },
  cardSubtext: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#a5b4fc',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#a5b4fc',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  restoreRow: {
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 40,
    justifyContent: 'center',
  },
  restoreText: {
    fontSize: 13,
    color: '#64748b',
    textDecorationLine: 'underline',
  },
  legal: {
    fontSize: 10,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 15,
    paddingHorizontal: 8,
    marginTop: 8,
  },
});
