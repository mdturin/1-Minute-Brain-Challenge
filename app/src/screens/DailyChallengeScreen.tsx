import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';
import { getTodayRecord, getRecentHistory, type DailyRecord } from '../storage/dailyChallenge';
import { localDateString } from '../logic/dateUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'DailyChallenge'>;

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

function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

function getShortDay(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 1);
}

export default function DailyChallengeScreen({ navigation }: Props) {
  const [todayRecord, setTodayRecord] = useState<DailyRecord | null>(null);
  const [recentHistory, setRecentHistory] = useState<DailyRecord[]>([]);
  const [countdown, setCountdown] = useState(msUntilMidnight());
  const today = localDateString();

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const [record, history] = await Promise.all([
        getTodayRecord(),
        getRecentHistory(7),
      ]);
      if (!isMounted) return;
      setTodayRecord(record);
      setRecentHistory(history);
    };
    void load();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(msUntilMidnight());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePlay = () => {
    navigation.navigate('Game', { difficulty: 'medium', isDailyChallenge: true });
  };

  const completed = todayRecord?.completed ?? false;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
            <Ionicons name="arrow-back" size={22} color="#a5b4fc" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Daily Challenge</Text>
          <View style={styles.backButton} />
        </View>

        {/* Date Card */}
        <View style={styles.dateCard}>
          <View style={styles.dateRow}>
            <Ionicons name="calendar" size={22} color="#fbbf24" />
            <Text style={styles.dateText}>{formatDisplayDate(today)}</Text>
          </View>
          <View style={styles.badgeRow}>
            <View style={styles.freeBadge}>
              <Ionicons name="flash" size={12} color="#22c55e" />
              <Text style={styles.freeBadgeText}>FREE · No energy cost</Text>
            </View>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyBadgeText}>Medium</Text>
            </View>
          </View>
          <Text style={styles.description}>Same puzzles for everyone. One attempt per day.</Text>
        </View>

        {/* Status Card */}
        {completed ? (
          <View style={styles.completedCard}>
            <View style={styles.completedRow}>
              <Ionicons name="checkmark-circle" size={28} color="#22c55e" />
              <Text style={styles.completedText}>Completed!</Text>
            </View>
            <Text style={styles.completedScore}>Score: {todayRecord?.score ?? 0}</Text>
            <Text style={styles.nextResetLabel}>Next challenge in</Text>
            <Text style={styles.countdown}>{formatCountdown(countdown)}</Text>
          </View>
        ) : (
          <View style={styles.playCard}>
            <View style={styles.countdownRow}>
              <Ionicons name="time-outline" size={18} color="#94a3b8" />
              <Text style={styles.countdownLabel}>Resets in </Text>
              <Text style={styles.countdownValue}>{formatCountdown(countdown)}</Text>
            </View>
            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlay}
              activeOpacity={0.85}
            >
              <Ionicons name="play" size={18} color="#fff" />
              <Text style={styles.playButtonText}>Play Today's Challenge</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 7-Day History */}
        <Text style={styles.sectionLabel}>Last 7 Days</Text>
        <View style={styles.historyRow}>
          {recentHistory.slice().reverse().map((record) => (
            <View key={record.date} style={styles.historyItem}>
              <View style={[
                styles.historyDot,
                record.completed ? styles.historyDotCompleted : styles.historyDotMissed,
                record.date === today && styles.historyDotToday,
              ]}>
                {record.completed ? (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                ) : record.date === today ? (
                  <Ionicons name="ellipse-outline" size={12} color="#fbbf24" />
                ) : (
                  <Ionicons name="close" size={12} color="#64748b" />
                )}
              </View>
              <Text style={[
                styles.historyDayLabel,
                record.date === today && styles.historyDayLabelToday,
              ]}>
                {getShortDay(record.date)}
              </Text>
            </View>
          ))}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f9fafb',
  },
  dateCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.3)',
    marginBottom: 16,
    gap: 10,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f9fafb',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  freeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34,197,94,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  freeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22c55e',
  },
  difficultyBadge: {
    backgroundColor: 'rgba(234,179,8,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  difficultyBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#eab308',
  },
  description: {
    fontSize: 13,
    color: '#94a3b8',
  },
  completedCard: {
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
    marginBottom: 24,
    alignItems: 'center',
    gap: 8,
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  completedText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#22c55e',
  },
  completedScore: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f9fafb',
  },
  nextResetLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  countdown: {
    fontSize: 24,
    fontWeight: '800',
    color: '#a5b4fc',
    letterSpacing: 2,
  },
  playCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(165,180,252,0.2)',
    marginBottom: 24,
    gap: 16,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countdownLabel: {
    fontSize: 13,
    color: '#94a3b8',
  },
  countdownValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#a5b4fc',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#fbbf24',
    paddingVertical: 14,
    borderRadius: 12,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyItem: {
    alignItems: 'center',
    gap: 6,
  },
  historyDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyDotCompleted: {
    backgroundColor: '#22c55e',
  },
  historyDotMissed: {
    backgroundColor: '#1e293b',
  },
  historyDotToday: {
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  historyDayLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  historyDayLabelToday: {
    color: '#fbbf24',
  },
});
