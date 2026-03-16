import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View, Alert, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { loadUserProfile, saveUserProfile, type UserProfile } from '../storage/userProfile';
import { loadStats, type GameStats } from '../storage/stats';
import { useEnergy } from '../logic/useEnergy';
import PrimaryButton from '../components/PrimaryButton';
import { signIn, signUp, signOut, onAuthStateChanged, type AuthUser } from '../logic/auth';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const { energy, maxEnergy, isLoading: energyLoading } = useEnergy();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((authUser) => {
      setUser(authUser);
      if (authUser) {
        const init = async () => {
          try {
            const [loadedProfile, loadedStats] = await Promise.all([loadUserProfile(), loadStats()]);
            setProfile(loadedProfile);
            setStats(loadedStats);
          } catch {
            setHasError(true);
          }
        };
        void init();
      } else {
        setProfile(null);
        setStats(null);
      }
    });
    return unsubscribe;
  }, []);

  const handleChange = (key: keyof UserProfile, value: string) => {
    setProfile((current) => {
      if (!current) return current;
      if (key === 'age') {
        const numeric = value.replace(/[^0-9]/g, '');
        return { ...current, age: numeric.length ? Number(numeric) : undefined };
      }
      if (key === 'country') return { ...current, country: value.trim() || undefined };
      if (key === 'displayName') return { ...current, displayName: value };
      return current;
    });
  };

  const handleAuth = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setAuthError('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 8) {
      setAuthError('Password must be at least 8 characters');
      return;
    }
    setAuthError('');
    setAuthLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      setEmail('');
      setPassword('');
      setAuthError('');
    } catch (error: any) {
      setAuthError(error.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Logout failed');
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    setHasError(false);
    try {
      await saveUserProfile(profile);
    } catch (error: any) {
      setHasError(true);
      Alert.alert('Error', error.message || 'Unable to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Guest / Auth screen
  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.authScroll}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#e5e7eb" />
          </TouchableOpacity>

          <View style={styles.authContainer}>
            <View style={styles.authIconCircle}>
              <Ionicons name="person" size={36} color="#a5b4fc" />
            </View>
            <Text style={styles.authTitle}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </Text>
            <Text style={styles.authSubtitle}>
              {isLogin ? 'Sign in to sync your progress' : 'Save your scores across devices'}
            </Text>

            <View style={styles.inputGroup}>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color="#64748b" />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor="#475569"
                />
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color="#64748b" />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor="#475569"
                />
              </View>
            </View>

            {authError ? <Text style={styles.errorText}>{authError}</Text> : null}

            <TouchableOpacity
              style={[styles.authButton, authLoading && styles.authButtonDisabled]}
              onPress={handleAuth}
              disabled={authLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.authButtonText}>
                {authLoading ? (isLogin ? 'Signing in...' : 'Creating account...') : isLogin ? 'Sign In' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.switchText}>
                {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Loading state
  if (!profile || !stats) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#a5b4fc" size="large" />
          {hasError && <Text style={styles.errorText}>Unable to load profile.</Text>}
        </View>
      </SafeAreaView>
    );
  }

  const initials = profile.displayName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join('') || 'G';

  const averageScore = stats.gamesPlayed > 0 ? Math.round(stats.totalScore / stats.gamesPlayed) : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#e5e7eb" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Profile</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Avatar Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.profileName}>{profile.displayName || 'Guest'}</Text>
          {user.email && <Text style={styles.profileEmail}>{user.email}</Text>}
        </View>

        {/* Edit Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Edit Profile</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={18} color="#64748b" />
            <TextInput
              style={styles.input}
              placeholder="Display name"
              placeholderTextColor="#475569"
              value={profile.displayName}
              onChangeText={(text) => handleChange('displayName', text)}
            />
          </View>
          <View style={styles.fieldRow}>
            <View style={[styles.inputWrapper, { flex: 1 }]}>
              <Ionicons name="calendar-outline" size={18} color="#64748b" />
              <TextInput
                style={styles.input}
                placeholder="Age"
                placeholderTextColor="#475569"
                keyboardType="number-pad"
                value={typeof profile.age === 'number' ? String(profile.age) : ''}
                onChangeText={(text) => handleChange('age', text)}
              />
            </View>
            <View style={[styles.inputWrapper, { flex: 1 }]}>
              <Ionicons name="globe-outline" size={18} color="#64748b" />
              <TextInput
                style={styles.input}
                placeholder="Country"
                placeholderTextColor="#475569"
                value={profile.country ?? ''}
                onChangeText={(text) => handleChange('country', text)}
              />
            </View>
          </View>
          {hasError && <Text style={styles.errorText}>Could not save changes.</Text>}
          <PrimaryButton
            label={isSaving ? 'Saving...' : 'Save Profile'}
            onPress={handleSave}
            disabled={isSaving}
          />
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lifetime Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="trophy-outline" size={20} color="#eab308" />
              <Text style={styles.statValue}>{stats.bestScore}</Text>
              <Text style={styles.statLabel}>Best Score</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="game-controller-outline" size={20} color="#60a5fa" />
              <Text style={styles.statValue}>{stats.gamesPlayed}</Text>
              <Text style={styles.statLabel}>Games</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="flame-outline" size={20} color="#ef4444" />
              <Text style={styles.statValue}>{stats.bestStreak}</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="stats-chart-outline" size={20} color="#22c55e" />
              <Text style={styles.statValue}>{averageScore}</Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
          </View>
        </View>

        {/* Energy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Energy</Text>
          <View style={styles.energyRow}>
            <Ionicons name="flash" size={20} color="#a5b4fc" />
            <Text style={styles.energyText}>
              {energyLoading ? 'Loading...' : `${energy} / ${maxEnergy}`}
            </Text>
          </View>
          <Text style={styles.energyHint}>Refills 10 per hour. Watch ads on the home screen for bonus energy.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050816',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050816',
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f9fafb',
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(165,180,252,0.1)',
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f9fafb',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f9fafb',
  },
  profileEmail: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  inputGroup: {
    gap: 12,
    marginBottom: 16,
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    color: '#f9fafb',
    fontSize: 15,
    paddingVertical: 10,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 10,
  },
  errorText: {
    fontSize: 12,
    color: '#fbbf24',
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#111827',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f9fafb',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  energyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  energyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#a5b4fc',
  },
  energyHint: {
    fontSize: 12,
    color: '#64748b',
  },
  // Auth screen styles
  authScroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
    paddingBottom: 40,
  },
  authIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(165,180,252,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(165,180,252,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f9fafb',
    marginBottom: 6,
  },
  authSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
    textAlign: 'center',
  },
  authButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  authButtonDisabled: {
    backgroundColor: '#374151',
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  switchText: {
    fontSize: 14,
    color: '#6366f1',
    textAlign: 'center',
  },
});
