import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { loadUserProfile, saveUserProfile, type UserProfile } from '../storage/userProfile';
import { loadStats, type GameStats } from '../storage/stats';
import { useEnergy } from '../logic/useEnergy';
import PrimaryButton from '../components/PrimaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasError, setHasError] = useState(false);

  const { energy, maxEnergy, isLoading: energyLoading } = useEnergy();

  useEffect(() => {
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
  }, []);

  const handleChange = (key: keyof UserProfile, value: string) => {
    setProfile((current) => {
      if (!current) {
        return current;
      }
      if (key === 'age') {
        const numeric = value.replace(/[^0-9]/g, '');
        return {
          ...current,
          age: numeric.length ? Number(numeric) : undefined,
        };
      }
      if (key === 'country') {
        return {
          ...current,
          country: value.trim() || undefined,
        };
      }
      if (key === 'displayName') {
        return {
          ...current,
          displayName: value,
        };
      }
      return current;
    });
  };

  const handleSave = async () => {
    if (!profile) {
      return;
    }
    const trimmedName = profile.displayName.trim();
    const nextProfile: UserProfile = {
      ...profile,
      displayName: trimmedName || 'Guest',
    };

    setIsSaving(true);
    setHasError(false);
    try {
      await saveUserProfile(nextProfile);
      setProfile(nextProfile);
    } catch {
      setHasError(true);
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile || !stats) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#ffffff" />
          {hasError && <Text style={styles.errorText}>Unable to load profile right now.</Text>}
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

  const averageScore =
    stats.gamesPlayed > 0 ? Math.round(stats.totalScore / stats.gamesPlayed) : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>Your Profile</Text>
          <Text style={styles.backLink} onPress={() => navigation.goBack()}>
            Close
          </Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileSummaryText}>
            <Text style={styles.profileName}>{profile.displayName || 'Guest'}</Text>
            {profile.country && (
              <Text style={styles.profileMeta}>Country: {profile.country}</Text>
            )}
            {typeof profile.age === 'number' && (
              <Text style={styles.profileMeta}>Age: {profile.age}</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Info</Text>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Display name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor="#6b7280"
              value={profile.displayName}
              onChangeText={(text) => handleChange('displayName', text)}
            />
          </View>
          <View style={styles.fieldRow}>
            <View style={[styles.fieldGroup, styles.fieldHalf]}>
              <Text style={styles.fieldLabel}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="18"
                placeholderTextColor="#6b7280"
                keyboardType="number-pad"
                value={typeof profile.age === 'number' ? String(profile.age) : ''}
                onChangeText={(text) => handleChange('age', text)}
              />
            </View>
            <View style={[styles.fieldGroup, styles.fieldHalf]}>
              <Text style={styles.fieldLabel}>Country</Text>
              <TextInput
                style={styles.input}
                placeholder="Country"
                placeholderTextColor="#6b7280"
                value={profile.country ?? ''}
                onChangeText={(text) => handleChange('country', text)}
              />
            </View>
          </View>
          {hasError && (
            <Text style={styles.errorText}>Couldn&apos;t save profile changes. Please try again.</Text>
          )}
          <PrimaryButton
            label={isSaving ? 'Saving...' : 'Save profile'}
            onPress={handleSave}
            disabled={isSaving}
            style={styles.saveButton}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lifetime Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Best Score</Text>
              <Text style={styles.statValue}>{stats.bestScore}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Games Played</Text>
              <Text style={styles.statValue}>{stats.gamesPlayed}</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Best Streak</Text>
              <Text style={styles.statValue}>{stats.bestStreak}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Avg Score</Text>
              <Text style={styles.statValue}>{averageScore}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Energy</Text>
          <Text style={styles.energyText}>
            {energyLoading ? 'Loading energy...' : `Current energy: ${energy} / ${maxEnergy}`}
          </Text>
          <Text style={styles.energyHint}>
            Energy refills over time and can be boosted by watching rewarded ads on the home screen.
          </Text>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050816',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f9fafb',
  },
  backLink: {
    fontSize: 14,
    color: '#a5b4fc',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f9fafb',
  },
  profileSummaryText: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f9fafb',
  },
  profileMeta: {
    marginTop: 4,
    fontSize: 13,
    color: '#9ca3af',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 12,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  fieldHalf: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 4,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#f9fafb',
    fontSize: 14,
    backgroundColor: '#020617',
  },
  saveButton: {
    marginTop: 4,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: '#fbbf24',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f9fafb',
  },
  energyText: {
    fontSize: 14,
    color: '#e5e7eb',
    marginBottom: 4,
  },
  energyHint: {
    fontSize: 12,
    color: '#9ca3af',
  },
});

