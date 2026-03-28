import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList } from '../../App';
import { signInAsGuest, signInWithGoogle, signInWithGoogleWeb } from '../logic/auth';
import { loadUserProfile } from '../storage/userProfile';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [loadingType, setLoadingType] = useState<'google' | 'guest' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loading = loadingType !== null;

  const handleGoogle = async () => {
    setError(null);
    setLoadingType('google');
    try {
      if (Platform.OS === 'web') {
        await signInWithGoogleWeb();
      } else {
        await GoogleSignin.hasPlayServices();
        const response = await GoogleSignin.signIn();
        if (!isSuccessResponse(response)) {
          setLoadingType(null);
          return;
        }
        const { idToken } = response.data;
        await signInWithGoogle(idToken, null);
      }
      try {
        const profile = await loadUserProfile();
        if (profile.consentAccepted) {
          navigation.replace('Home');
          return;
        }
      } catch {}
      const accepted = await AsyncStorage.getItem('hasAcceptedPolicy');
      navigation.replace(accepted === 'true' ? 'Home' : 'Consent');
    } catch {
      setError('Google sign-in failed. Please try again.');
      setLoadingType(null);
    }
  };

  const handleGuest = async () => {
    setError(null);
    setLoadingType('guest');
    try {
      await signInAsGuest();
      const accepted = await AsyncStorage.getItem('hasAcceptedPolicy');
      navigation.replace(accepted === 'true' ? 'Home' : 'Consent');
    } catch {
      setError('Could not continue as guest. Please try again.');
      setLoadingType(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Logo area */}
        <View style={styles.logoArea}>
          <View style={styles.iconCircle}>
            <Ionicons name="flash" size={52} color="#fbbf24" />
          </View>
          <Text style={styles.appName}>1 Minute Brain Challenge</Text>
        </View>

        {/* Headline */}
        <View style={styles.headlineArea}>
          <Text style={styles.headline}>Create your account</Text>
          <Text style={styles.subtext}>Save your progress and compete globally</Text>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttonsArea}>
          <TouchableOpacity
            style={[styles.googleButton, loading && styles.buttonDisabled]}
            onPress={handleGoogle}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loadingType === 'google' ? (
              <>
                <ActivityIndicator size="small" color="#6366f1" />
                <Text style={styles.googleText}>Signing in…</Text>
              </>
            ) : (
              <>
                <Text style={styles.googleLogo}>G</Text>
                <Text style={styles.googleText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.guestButton, loading && styles.buttonDisabled]}
            onPress={handleGuest}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loadingType === 'guest' ? (
              <>
                <ActivityIndicator size="small" color="#94a3b8" />
                <Text style={styles.guestText}>Loading…</Text>
              </>
            ) : (
              <>
                <Ionicons name="person-outline" size={18} color="#94a3b8" />
                <Text style={styles.guestText}>Continue as Guest</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.guestNote}>
            You can sign in later from your Profile
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050816',
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 24,
    justifyContent: 'space-between',
  },
  logoArea: {
    alignItems: 'center',
    paddingTop: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(251,191,36,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f9fafb',
    textAlign: 'center',
  },
  headlineArea: {
    alignItems: 'center',
  },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f9fafb',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
  },
  buttonsArea: {
    gap: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    borderRadius: 14,
  },
  googleLogo: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4285F4',
  },
  googleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'transparent',
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  guestText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
  },
  guestNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
  },
});
