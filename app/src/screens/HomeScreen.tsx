import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, ActivityIndicator, Animated, Easing, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import BannerAd from '../components/BannerAd';
import { DIFFICULTIES, orderedDifficulties, type Difficulty } from '../logic/difficulty';
import { loadStats } from '../storage/stats';
import { useEnergy } from '../logic/useEnergy';
import { useSubscription } from '../logic/useSubscription';
import { canStartGame, getCostForDifficulty, REFILL_PER_HOUR, REWARDED_AD_ENERGY_GRANT, REWARDED_AD_DAILY_LIMIT } from '../logic/energy';
import { showRewardedWithCallbacks } from '../logic/ads';
import { getTodayRecord, type DailyRecord } from '../storage/dailyChallenge';
import { Ionicons } from '@expo/vector-icons';
import { canWatchRewardedToday, getDailyRewardedCount } from '../logic/ads.native';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const DIFFICULTY_COLORS: Record<Difficulty, { accent: string; border: string; icon: string }> = {
  easy: { accent: '#22c55e', border: 'rgba(34,197,94,0.3)', icon: 'leaf-outline' },
  medium: { accent: '#eab308', border: 'rgba(234,179,8,0.3)', icon: 'flame-outline' },
  hard: { accent: '#ef4444', border: 'rgba(239,68,68,0.3)', icon: 'skull-outline' },
};

function msUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function HomeScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [bestScore, setBestScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [currentDayStreak, setCurrentDayStreak] = useState(0);
  const [dailyRecord, setDailyRecord] = useState<DailyRecord | null>(null);
  const [dailyCountdown, setDailyCountdown] = useState(msUntilMidnight());
  const { isSubscribed } = useSubscription();
  const { energy, maxEnergy, isLoading: energyLoading, spendForDifficulty, grantEnergy } = useEnergy({ isSubscribed });
  const [energyMessage, setEnergyMessage] = useState<string | null>(null);
  const [isAnimatingPlay, setIsAnimatingPlay] = useState(false);
  const [rewardedCount, setRewardedCount] = useState(0);
  const [rewardedAvailable, setRewardedAvailable] = useState(true);

  const animatedEnergyValue = useRef(new Animated.Value(energy)).current;
  const pulseValue = useRef(new Animated.Value(0)).current;
  const rewardPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isAnimatingPlay) return;
    Animated.timing(animatedEnergyValue, {
      toValue: energy,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [energy, isAnimatingPlay, animatedEnergyValue]);

  useEffect(() => {
    const fetchData = async () => {
      const [stats, record] = await Promise.all([
        loadStats(),
        getTodayRecord(),
      ]);
      setBestScore(stats.bestScore);
      setGamesPlayed(stats.gamesPlayed);
      setAverageScore(stats.gamesPlayed > 0 ? Math.round(stats.totalScore / stats.gamesPlayed) : 0);
      setCurrentDayStreak(stats.currentDayStreak);
      setDailyRecord(record);
      setLoading(false);
    };
    void fetchData();
  }, []);

  // Countdown to daily reset
  useEffect(() => {
    const interval = setInterval(() => {
      setDailyCountdown(msUntilMidnight());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load daily rewarded ad count on mount and whenever screen is focused
  useEffect(() => {
    const loadRewardedCount = async () => {
      const count = await getDailyRewardedCount();
      const available = await canWatchRewardedToday();
      setRewardedCount(count);
      setRewardedAvailable(available);
    };
    void loadRewardedCount();
  }, []);

  // Urgency pulse on the "Watch ad" button when energy is low
  useEffect(() => {
    if (energy < 10 && rewardedAvailable) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(rewardPulseAnim, { toValue: 1.04, duration: 600, useNativeDriver: true }),
          Animated.timing(rewardPulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      rewardPulseAnim.setValue(1);
    }
  }, [energy, rewardedAvailable, rewardPulseAnim]);

  const handlePlayPress = async (difficultyKey: Difficulty) => {
    if (isAnimatingPlay) return;
    setEnergyMessage(null);
    setIsAnimatingPlay(true);

    const startingEnergy = energy;
    const result = await spendForDifficulty(difficultyKey);
    if (result.success) {
      const cost = getCostForDifficulty(difficultyKey);
      const targetEnergy = Math.max(0, startingEnergy - cost);

      Animated.sequence([
        Animated.timing(pulseValue, { toValue: 1, duration: 120, useNativeDriver: false }),
        Animated.timing(pulseValue, { toValue: 0, duration: 120, useNativeDriver: false }),
        Animated.timing(animatedEnergyValue, { toValue: targetEnergy, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      ]).start(() => {
        setIsAnimatingPlay(false);
        navigation.navigate('Game', { difficulty: difficultyKey });
      });
    } else if (result.reason === 'insufficient') {
      setIsAnimatingPlay(false);
      navigation.navigate('Paywall');
    } else {
      setEnergyMessage('Something went wrong. Please try again.');
      setIsAnimatingPlay(false);
    }
  };

  const animatedEnergyWidth = animatedEnergyValue.interpolate({
    inputRange: [0, maxEnergy || 1],
    outputRange: ['0%', '100%'],
  });

  const pulseScale = pulseValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const dailyCompleted = dailyRecord?.completed ?? false;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name="bulb" size={28} color="#a5b4fc" />
            <Text style={styles.title}>1 Minute Brain Challenge</Text>
          </View>
          {/* SHOW_UPGRADE: set to true when IAP is ready */}
        </View>

        {/* Day Streak Badge */}
        {!loading && (
          currentDayStreak >= 1 ? (
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={18} color="#ef4444" />
              <Text style={styles.streakText}>{currentDayStreak} Day Streak</Text>
            </View>
          ) : (
            <Text style={styles.streakPrompt}>Play today to start your streak!</Text>
          )
        )}

        {/* Energy Card */}
        <View style={[styles.energyCard, isSubscribed && styles.energyCardUnlimited]} accessibilityLabel={isSubscribed ? 'Energy: Unlimited' : `Energy: ${energy} out of ${maxEnergy}`}>
          <View style={styles.energyHeaderRow}>
            <View style={styles.energyLabelRow}>
              <Ionicons name={isSubscribed ? 'star' : 'flash'} size={18} color={isSubscribed ? '#eab308' : '#a5b4fc'} />
              <Text style={styles.energyLabel}>Energy</Text>
            </View>
            <Text style={[styles.energyValue, isSubscribed && styles.energyValueUnlimited]}>
              {isSubscribed ? 'Unlimited' : (energyLoading ? '...' : `${energy} / ${maxEnergy}`)}
            </Text>
          </View>
          {isSubscribed ? (
            <View style={styles.energyBarBgGold}>
              <View style={styles.energyBarFillGold} />
            </View>
          ) : (
            <View style={styles.energyBarBg}>
              <Animated.View
                style={[styles.energyBarFill, { width: animatedEnergyWidth, transform: [{ scaleY: pulseScale }] }]}
              />
            </View>
          )}
          <Text style={[styles.energyHint, isSubscribed && styles.energyHintUnlimited]}>
            {isSubscribed ? 'Active subscription' : `Refills ${REFILL_PER_HOUR} per hour`}
          </Text>
        </View>

        {energyMessage ? <Text style={styles.energyMessage}>{energyMessage}</Text> : null}

        {/* Daily Challenge Card */}
        <TouchableOpacity
          style={[styles.dailyCard, dailyCompleted && styles.dailyCardCompleted]}
          onPress={() => navigation.navigate('DailyChallenge')}
          activeOpacity={0.85}
        >
          <View style={styles.dailyHeader}>
            <View style={styles.dailyLabelRow}>
              <Ionicons name="calendar" size={20} color="#fbbf24" />
              <Text style={styles.dailyLabel}>Daily Challenge</Text>
            </View>
            {dailyCompleted ? (
              <View style={styles.dailyCompletedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
                <Text style={styles.dailyCompletedBadgeText}>Done</Text>
              </View>
            ) : (
              <View style={styles.dailyFreeBadge}>
                <Ionicons name="flash" size={12} color="#22c55e" />
                <Text style={styles.dailyFreeBadgeText}>FREE</Text>
              </View>
            )}
          </View>
          {dailyCompleted ? (
            <Text style={styles.dailySubtext}>Score: {dailyRecord?.score ?? 0} · Next in {formatCountdown(dailyCountdown)}</Text>
          ) : (
            <Text style={styles.dailySubtext}>Medium difficulty · No energy cost · Resets in {formatCountdown(dailyCountdown)}</Text>
          )}
        </TouchableOpacity>

        {/* Difficulty Cards */}
        <Text style={styles.sectionLabel}>Choose Your Challenge</Text>

        {orderedDifficulties.map((key) => {
          const config = DIFFICULTIES[key];
          const cost = getCostForDifficulty(config.key);
          const colors = DIFFICULTY_COLORS[key];
          const disabled = energyLoading || isAnimatingPlay || (!isSubscribed && !canStartGame(energy, config.key));
          return (
            <View key={config.key} style={[styles.modeCard, { borderColor: colors.border }]}>
              <View style={styles.modeHeader}>
                <View style={styles.modeLabelRow}>
                  <Ionicons name={colors.icon as any} size={20} color={colors.accent} />
                  <Text style={[styles.modeLabel, { color: colors.accent }]}>{config.label}</Text>
                </View>
                <View style={styles.modeCostBadge}>
                  {isSubscribed ? (
                    <Ionicons name="infinite" size={14} color="#eab308" />
                  ) : (
                    <>
                      <Ionicons name="flash" size={12} color="#a5b4fc" />
                      <Text style={styles.modeCostText}>{cost}</Text>
                    </>
                  )}
                </View>
              </View>
              <Text style={styles.modeDescription}>
                {config.durationSeconds}s · {config.description}
              </Text>
              <TouchableOpacity
                style={[styles.playButton, { backgroundColor: disabled ? '#374151' : colors.accent }]}
                onPress={() => handlePlayPress(config.key)}
                disabled={disabled}
                activeOpacity={0.8}
              >
                <Ionicons name="play" size={16} color={disabled ? '#9ca3af' : '#fff'} />
                <Text style={[styles.playButtonText, disabled && styles.playButtonTextDisabled]}>
                  Play {config.label}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Reward Ad */}
        {!isSubscribed && energy < maxEnergy && (
          rewardedAvailable ? (
            <Animated.View style={{ transform: [{ scale: rewardPulseAnim }] }}>
              <TouchableOpacity
                style={styles.rewardButton}
                onPress={() => {
                  setEnergyMessage(null);
                  showRewardedWithCallbacks(
                    () => {
                      void grantEnergy(REWARDED_AD_ENERGY_GRANT);
                      setRewardedCount((c) => c + 1);
                      setRewardedAvailable(rewardedCount + 1 < REWARDED_AD_DAILY_LIMIT);
                    },
                    undefined,
                    () => { setEnergyMessage('Ad was not available. Please try again later.'); }
                  );
                }}
                disabled={energyLoading}
                activeOpacity={0.8}
              >
                <Ionicons name="videocam-outline" size={18} color="#a5b4fc" />
                <Text style={styles.rewardButtonText}>
                  Watch ad (+{REWARDED_AD_ENERGY_GRANT} energy) · {REWARDED_AD_DAILY_LIMIT - rewardedCount} left today
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <View style={[styles.rewardButton, styles.rewardButtonDisabled]}>
              <Ionicons name="time-outline" size={18} color="#64748b" />
              <Text style={styles.rewardButtonTextDisabled}>Come back tomorrow for more energy!</Text>
            </View>
          )
        )}

        {/* Stats */}
        <Text style={styles.sectionLabel}>Your Stats</Text>
        {loading ? (
          <ActivityIndicator color="#a5b4fc" />
        ) : (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="trophy-outline" size={20} color="#eab308" />
              <Text style={styles.statValue}>{bestScore}</Text>
              <Text style={styles.statLabel}>Best Score</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="game-controller-outline" size={20} color="#60a5fa" />
              <Text style={styles.statValue}>{gamesPlayed}</Text>
              <Text style={styles.statLabel}>Games</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="stats-chart-outline" size={20} color="#22c55e" />
              <Text style={styles.statValue}>{averageScore}</Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
          </View>
        )}

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-outline" size={22} color="#a5b4fc" />
            <Text style={styles.navLabel}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Leaderboard')}>
            <Ionicons name="podium-outline" size={22} color="#a5b4fc" />
            <Text style={styles.navLabel}>Leaderboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Settings' as any)}>
            <Ionicons name="settings-outline" size={22} color="#a5b4fc" />
            <Text style={styles.navLabel}>Settings</Text>
          </TouchableOpacity>
        </View>

        <BannerAd />
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
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(234,179,8,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(234,179,8,0.3)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  upgradeButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#eab308',
  },
  subscribedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(234,179,8,0.1)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  subscribedBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#eab308',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f9fafb',
    letterSpacing: -0.5,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
  },
  streakText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ef4444',
  },
  streakPrompt: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 12,
  },
  energyCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(165,180,252,0.2)',
    marginBottom: 8,
  },
  energyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  energyLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  energyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  energyValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#a5b4fc',
  },
  energyBarBg: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#1e293b',
    overflow: 'hidden',
  },
  energyBarFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#10b981',
  },
  energyHint: {
    marginTop: 6,
    fontSize: 11,
    color: '#64748b',
  },
  energyCardUnlimited: {
    borderColor: 'rgba(234,179,8,0.3)',
  },
  energyValueUnlimited: {
    color: '#eab308',
  },
  energyBarBgGold: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#1e293b',
    overflow: 'hidden',
  },
  energyBarFillGold: {
    height: '100%',
    width: '100%',
    borderRadius: 999,
    backgroundColor: '#eab308',
  },
  energyHintUnlimited: {
    color: '#eab308',
  },
  energyMessage: {
    fontSize: 12,
    color: '#fbbf24',
    textAlign: 'center',
    marginBottom: 8,
  },
  dailyCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.3)',
    marginBottom: 8,
    gap: 6,
  },
  dailyCardCompleted: {
    borderColor: 'rgba(34,197,94,0.3)',
    backgroundColor: 'rgba(34,197,94,0.05)',
  },
  dailyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dailyLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dailyLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fbbf24',
  },
  dailyFreeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34,197,94,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  dailyFreeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#22c55e',
  },
  dailyCompletedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34,197,94,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  dailyCompletedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#22c55e',
  },
  dailySubtext: {
    fontSize: 12,
    color: '#94a3b8',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  modeCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  modeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeLabel: {
    fontSize: 18,
    fontWeight: '800',
  },
  modeCostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(165,180,252,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  modeCostText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#a5b4fc',
  },
  modeDescription: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 12,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  playButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  playButtonTextDisabled: {
    color: '#9ca3af',
  },
  rewardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(165,180,252,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(165,180,252,0.3)',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  rewardButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a5b4fc',
  },
  rewardButtonDisabled: {
    borderColor: 'rgba(100,116,139,0.3)',
    backgroundColor: 'rgba(100,116,139,0.05)',
  },
  rewardButtonTextDisabled: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f9fafb',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 16,
  },
  navButton: {
    alignItems: 'center',
    gap: 4,
  },
  navLabel: {
    fontSize: 11,
    color: '#94a3b8',
  },
});
