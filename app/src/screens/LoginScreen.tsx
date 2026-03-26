import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList } from '../../App';
import { signInAsGuest, signInWithGoogle } from '../logic/auth';

WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: Constants.expoConfig?.extra?.googleWebClientId,
    androidClientId: Constants.expoConfig?.extra?.googleAndroidClientId,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const params = response.params as Record<string, string>;
      const idToken = response.authentication?.idToken ?? params?.id_token ?? null;
      const accessToken = response.authentication?.accessToken ?? params?.access_token ?? null;
      if (!idToken && !accessToken) {
        setError('Google sign-in failed. Please try again.');
        setLoading(false);
        return;
      }
      setLoading(true);
      signInWithGoogle(idToken, accessToken)
        .then(() => navigation.replace('Consent'))
        .catch(() => {
          setError('Google sign-in failed. Please try again.');
          setLoading(false);
        });
    } else if (response?.type === 'error') {
      setError('Google sign-in was cancelled or failed.');
      setLoading(false);
    }
  }, [response]);

  const handleGoogle = () => {
    setError(null);
    setLoading(true);
    promptAsync().catch(() => setLoading(false));
  };

  const handleGuest = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInAsGuest();
      navigation.replace('Consent');
    } catch {
      setError('Could not continue as guest. Please try again.');
      setLoading(false);
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

        {/* Buttons */}
        <View style={styles.buttonsArea}>
          <TouchableOpacity
            style={[styles.googleButton, (loading || !request) && styles.buttonDisabled]}
            onPress={handleGoogle}
            disabled={loading || !request}
            activeOpacity={0.85}
          >
            <Text style={styles.googleLogo}>G</Text>
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.guestButton, loading && styles.buttonDisabled]}
            onPress={handleGuest}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Ionicons name="person-outline" size={18} color="#94a3b8" />
            <Text style={styles.guestText}>Continue as Guest</Text>
          </TouchableOpacity>

          <Text style={styles.guestNote}>
            You can sign in later from your Profile
          </Text>
        </View>

        {/* Loading / Error */}
        {loading && (
          <ActivityIndicator size="small" color="#6366f1" style={styles.spinner} />
        )}
        {error && <Text style={styles.errorText}>{error}</Text>}
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
  spinner: {
    marginTop: 8,
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    fontSize: 13,
    marginBottom: 8,
  },
});
