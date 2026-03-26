import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList } from '../../App';
import { signOut } from '../logic/auth';

type Props = NativeStackScreenProps<RootStackParamList, 'Consent'>;

export default function ConsentScreen({ navigation }: Props) {
  const [agreed, setAgreed] = useState(false);

  const handleContinue = async () => {
    await AsyncStorage.setItem('hasAcceptedPolicy', 'true');
    navigation.replace('UserInfo');
  };

  const handleDecline = async () => {
    await signOut().catch(() => {});
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="shield-checkmark-outline" size={48} color="#6366f1" />
        </View>

        <Text style={styles.title}>Before you continue</Text>
        <Text style={styles.subtitle}>
          Please review and accept our policies to use 1 Minute Brain Challenge.
        </Text>

        {/* Policy summary */}
        <View style={styles.policyBox}>
          <View style={styles.policyItem}>
            <Ionicons name="lock-closed-outline" size={18} color="#6366f1" />
            <Text style={styles.policyText}>
              We collect gameplay data (scores, streaks) to power leaderboards and sync your progress across devices.
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.policyItem}>
            <Ionicons name="eye-off-outline" size={18} color="#6366f1" />
            <Text style={styles.policyText}>
              We never sell your personal data. Ads are served by Google AdMob and follow their privacy practices.
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.policyItem}>
            <Ionicons name="trash-outline" size={18} color="#6366f1" />
            <Text style={styles.policyText}>
              You can request deletion of your account and data at any time from the Settings screen.
            </Text>
          </View>
        </View>

        {/* Checkbox */}
        <TouchableOpacity
          style={styles.checkRow}
          onPress={() => setAgreed(!agreed)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
          <Text style={styles.checkLabel}>
            I have read and agree to the{' '}
            <Text
              style={styles.link}
              onPress={() => navigation.navigate('TermsOfService')}
            >
              Terms of Service
            </Text>
            {' '}and{' '}
            <Text
              style={styles.link}
              onPress={() => navigation.navigate('PrivacyPolicy')}
            >
              Privacy Policy
            </Text>
          </Text>
        </TouchableOpacity>

        {/* Continue button */}
        <TouchableOpacity
          style={[styles.continueBtn, !agreed && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!agreed}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>I Agree &amp; Continue</Text>
        </TouchableOpacity>

        {/* Decline */}
        <TouchableOpacity style={styles.declineBtn} onPress={handleDecline} activeOpacity={0.7}>
          <Text style={styles.declineText}>Decline &amp; Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050816',
  },
  container: {
    paddingHorizontal: 24,
    paddingVertical: 36,
    alignItems: 'center',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(99,102,241,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f9fafb',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 28,
  },
  policyBox: {
    width: '100%',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingVertical: 4,
    marginBottom: 28,
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  policyText: {
    flex: 1,
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 19,
  },
  divider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginHorizontal: 18,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    width: '100%',
    marginBottom: 28,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#334155',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  checkLabel: {
    flex: 1,
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 20,
  },
  link: {
    color: '#6366f1',
    fontWeight: '600',
  },
  continueBtn: {
    width: '100%',
    backgroundColor: '#6366f1',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  continueBtnDisabled: {
    opacity: 0.35,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  declineBtn: {
    paddingVertical: 10,
  },
  declineText: {
    fontSize: 13,
    color: '#475569',
  },
});
