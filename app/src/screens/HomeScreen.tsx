import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, ActivityIndicator, Animated, Easing, TouchableOpacity, useWindowDimensions, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import PrimaryButton from '../components/PrimaryButton';
import BannerAd from '../components/BannerAd';
import { DIFFICULTIES, orderedDifficulties } from '../logic/difficulty';
import { loadStats } from '../storage/stats';
import { useEnergy } from '../logic/useEnergy';
import { canStartGame, getCostForDifficulty } from '../logic/energy';
import { showRewardedWithCallbacks } from '../logic/ads';
import { loadUserProfile, type UserProfile } from '../storage/userProfile';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [bestScore, setBestScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const { energy, maxEnergy, isLoading: energyLoading, spendForDifficulty, grantEnergy } = useEnergy();
  const [energyMessage, setEnergyMessage] = useState<string | null>(null);
  const [isAnimatingPlay, setIsAnimatingPlay] = useState(false);
  const window = useWindowDimensions();

  const animatedEnergyValue = useRef(new Animated.Value(energy)).current;
  const pulseValue = useRef(new Animated.Value(0)).current;

  // Keep the animated bar in sync with the numeric energy value,
  // except while we're running the "play" animation sequence.
  useEffect(() => {
    if (isAnimatingPlay) {
      return;
    }

    Animated.timing(animatedEnergyValue, {
      toValue: energy,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [energy, isAnimatingPlay, animatedEnergyValue]);

  useEffect(() => {
    const fetchData = async () => {
      const [stats, loadedProfile] = await Promise.all([loadStats(), loadUserProfile()]);

      setBestScore(stats.bestScore);
      setGamesPlayed(stats.gamesPlayed);
      setAverageScore(stats.gamesPlayed > 0 ? Math.round(stats.totalScore / stats.gamesPlayed) : 0);
      setProfile(loadedProfile);
      setLoading(false);
      setProfileLoading(false);
    };

    void fetchData();
  }, []);

  const handlePlayPress = async (difficultyKey: keyof typeof DIFFICULTIES) => {
    if (isAnimatingPlay) {
      return;
    }

    setEnergyMessage(null);
    setIsAnimatingPlay(true);

    const startingEnergy = energy;
    const result = await spendForDifficulty(difficultyKey);
    if (result.success) {
      const cost = getCostForDifficulty(difficultyKey);
      const targetEnergy = Math.max(0, startingEnergy - cost);

      const pulseIn = Animated.timing(pulseValue, {
        toValue: 1,
        duration: 120,
        useNativeDriver: false,
      });

      const pulseOut = Animated.timing(pulseValue, {
        toValue: 0,
        duration: 120,
        useNativeDriver: false,
      });

      const shrink = Animated.timing(animatedEnergyValue, {
        toValue: targetEnergy,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      });

      Animated.sequence([pulseIn, pulseOut, shrink]).start(() => {
        setIsAnimatingPlay(false);
        navigation.navigate('Game', { difficulty: difficultyKey });
      });
    } else if (result.reason === 'insufficient') {
      setEnergyMessage('Not enough energy. Wait for it to refill or watch an ad to get more.');
      setIsAnimatingPlay(false);
    } else {
      setEnergyMessage('Something went wrong using energy. Please try again.');
      setIsAnimatingPlay(false);
    }
  };

  const energyFraction = Math.max(0, Math.min(1, energy / maxEnergy));
  const animatedEnergyWidth = animatedEnergyValue.interpolate({
    inputRange: [0, maxEnergy || 1],
    outputRange: ['0%', '100%'],
  });

  const pulseScale = pulseValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.innerContainer}>
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              style={styles.profileChip}
              onPress={() => navigation.navigate('Profile')}
              disabled={profileLoading}
              accessibilityLabel="Profile button, tap to view or edit profile"
            >
              <View style={styles.profileAvatar}>
                <Ionicons name="person" size={20} color="#f9fafb" />
              </View>
            </TouchableOpacity>
            <View style={styles.energyContainer} accessibilityLabel={`Energy bar, current level ${energy} out of ${maxEnergy}, refills over time`}>
              <View style={styles.energyHeaderRow}>
                <Ionicons name="flash" size={16} color="#a5b4fc" />
                <Text style={styles.energyLabel}>Energy</Text>
                <Text style={styles.energyValue}>
                  {energyLoading ? '...' : `${energy} / ${maxEnergy}`}
                </Text>
              </View>
              <View style={styles.energyBarBackground}>
                <Animated.View
                  style={[
                    styles.energyBarFill,
                    {
                      width: animatedEnergyWidth,
                      transform: [{ scaleY: pulseScale }],
                    },
                  ]}
                />
              </View>
            </View>
          </View>
          <Text style={styles.subtitle}>Answer as many mini-puzzles as you can.</Text>
          {energyMessage && <Text style={styles.energyMessage}>{energyMessage}</Text>}
        </View>

        <View style={styles.center}>
          {orderedDifficulties.map((key) => {
            const config = DIFFICULTIES[key];
            const cost = getCostForDifficulty(config.key);
            const disabled = energyLoading || isAnimatingPlay || !canStartGame(energy, config.key);
            return (
              <View key={config.key} style={styles.modeCard}>
                <Text style={styles.modeLabel}>{config.label}</Text>
                <Text style={styles.modeDescription}>{config.description}</Text>
                <PrimaryButton
                  label={`Play ${config.label}`}
                  onPress={() => handlePlayPress(config.key)}
                  disabled={disabled}
                />
              </View>
            );
          })}
        </View>

        {energy < maxEnergy && (
          <View style={styles.rewardContainer}>
            <Text style={styles.rewardText}>Low on energy?</Text>
            <PrimaryButton
              label="Watch ad to get energy"
              onPress={() => {
                setEnergyMessage(null);
                showRewardedWithCallbacks(
                  () => {
                    // grant a small amount of energy as a reward
                    void grantEnergy(10);
                  },
                  undefined,
                  () => {
                    setEnergyMessage('Ad was not available. Please try again later.');
                  }
                );
              }}
              style={styles.rewardButton}
              disabled={energyLoading}
            />
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.statsTitle}>Your Stats</Text>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Best Score</Text>
                <Text style={styles.statValue}>{bestScore}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Games Played</Text>
                <Text style={styles.statValue}>{gamesPlayed}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Avg Score</Text>
                <Text style={styles.statValue}>{averageScore}</Text>
              </View>
            </View>
          )}
        </View>
        <BannerAd />
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
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#050816',
  },
  innerContainer: {
    flex: 1,
    backgroundColor: '#050816',
  },
  header: {
    marginTop: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 12,
    fontSize: 15,
    color: '#a1a1aa',
    textAlign: 'center',
  },
  profileChip: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#020617',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.6)',
    shadowColor: '#020617',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f9fafb',
  },
  profileTextContainer: {
    maxWidth: 140,
  },
  profileName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  profileLink: {
    fontSize: 11,
    color: '#a5b4fc',
  },
  energyContainer: {
    flex: 1,
    marginTop: 0,
    marginLeft: 12,
    backgroundColor: '#0b1120',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.5)',
    shadowColor: '#0b1120',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  energyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  energyLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  energyValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#a5b4fc',
  },
  energyBarBackground: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: '#111827',
  },
  energyBarFill: {
    backgroundColor: '#10b981',
    borderRadius: 999,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  energyHint: {
    marginTop: 4,
    fontSize: 11,
    color: '#9ca3af',
  },
  energyMessage: {
    marginTop: 8,
    fontSize: 12,
    color: '#fbbf24',
    textAlign: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: 16,
    marginTop: 20,
  },
  rewardContainer: {
    marginBottom: 16,
    alignItems: 'center',
    gap: 8,
  },
  rewardText: {
    fontSize: 13,
    color: '#e5e7eb',
  },
  rewardButton: {
    minWidth: 240,
  },
  modeCard: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  modeLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f4f4f5',
  },
  modeAge: {
    marginTop: 4,
    fontSize: 13,
    color: '#a1a1aa',
  },
  modeDescription: {
    marginTop: 8,
    fontSize: 14,
    color: '#e4e4e7',
    marginBottom: 12,
  },
  modeEnergyCost: {
    marginTop: 4,
    fontSize: 13,
    color: '#a5b4fc',
    marginBottom: 8,
  },
  footer: {
    marginBottom: 12,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e4e4e7',
    marginBottom: 12,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#18181b',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#a1a1aa',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f4f4f5',
  },
});

