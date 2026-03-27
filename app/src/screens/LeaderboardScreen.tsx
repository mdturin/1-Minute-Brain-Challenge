import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchTopLeaderboard,
  fetchWeeklyLeaderboard,
  fetchMyRank,
  computeWeeklyRank,
  nextWeekResetMs,
  type LeaderboardEntry,
} from '../storage/leaderboard';
import { getAvatar } from '../constants/avatars';
import { getCurrentUser } from '../logic/auth';
import { loadStats } from '../storage/stats';
import { loadUserProfile } from '../storage/userProfile';

type Props = NativeStackScreenProps<RootStackParamList, 'Leaderboard'>;
type Tab = 'alltime' | 'weekly';

function countryFlag(country: string): string {
  if (!country || country.length !== 2) return '🌍';
  const codePoints = country.toUpperCase().split('').map(
    (ch) => 0x1f1e6 - 65 + ch.charCodeAt(0),
  );
  return String.fromCodePoint(...codePoints);
}


function RankMedal({ rank }: { rank: number }) {
  if (rank === 1) return <Text style={styles.medal}>🥇</Text>;
  if (rank === 2) return <Text style={styles.medal}>🥈</Text>;
  if (rank === 3) return <Text style={styles.medal}>🥉</Text>;
  return <Text style={styles.rankNumber}>#{rank}</Text>;
}

function formatCountdown(totalSeconds: number): string {
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

export default function LeaderboardScreen({ navigation }: Props) {
  const [tab, setTab] = useState<Tab>('alltime');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [myEntry, setMyEntry] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [resetSecondsLeft, setResetSecondsLeft] = useState(() =>
    Math.max(0, Math.floor((nextWeekResetMs() - Date.now()) / 1000)),
  );
  const isMountedRef = useRef(true);

  const user = getCurrentUser();

  useEffect(() => {
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setResetSecondsLeft(Math.max(0, Math.floor((nextWeekResetMs() - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const fetchFn = tab === 'alltime' ? fetchTopLeaderboard : fetchWeeklyLeaderboard;
      const [data, stats] = await Promise.all([
        fetchFn(25),
        user ? loadStats() : Promise.resolve(null),
      ]);
      if (user && stats) {
        const rank = tab === 'weekly'
          ? computeWeeklyRank(data, stats.bestScore)
          : await fetchMyRank(user.uid, stats.bestScore);
        setMyRank(rank);
        const found = data.find((e) => e.uid === user.uid);
        if (!found) {
          const synthetic: LeaderboardEntry = {
            uid: user.uid,
            displayName: user.displayName || 'You',
            country: '',
            bestScore: stats.bestScore,
            updatedAt: Date.now(),
          };
          if (rank && rank <= 25) {
            // Inject into the visible list at the correct position
            const merged = [...data];
            merged.splice(rank - 1, 0, synthetic);
            setEntries(merged.slice(0, 25));
            setMyEntry(null);
            // Enrich injected row with profile data async
            loadUserProfile().then((profile) => {
              if (!isMountedRef.current) return;
              setEntries((prev) => prev.map((e) =>
                e.uid === user.uid
                  ? { ...e, displayName: profile.displayName || e.displayName, country: profile.country ?? '', avatarId: profile.avatarId }
                  : e
              ));
            }).catch(() => {});
          } else {
            // Outside top 25 — show pinned footer row
            setEntries(data);
            setMyEntry(synthetic);
            loadUserProfile().then((profile) => {
              if (!isMountedRef.current) return;
              setMyEntry((prev) => prev
                ? { ...prev, displayName: profile.displayName || prev.displayName, country: profile.country ?? '', avatarId: profile.avatarId }
                : prev
              );
            }).catch(() => {});
          }
        } else {
          setEntries(data);
          setMyEntry(null);
        }
      } else {
        setEntries(data);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [tab]);

  const renderEntry = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const rank = index + 1;
    const isMe = user?.uid === item.uid;
    const av = getAvatar(item.avatarId, item.uid);
    return (
      <View style={[styles.row, isMe && styles.rowHighlight]}>
        <View style={styles.rankCell}>
          <RankMedal rank={rank} />
        </View>
        <View style={[styles.avatar, { backgroundColor: av.bg }]}>
          <Text style={styles.avatarEmoji}>{av.emoji}</Text>
        </View>
        <View style={styles.nameCell}>
          <Text style={styles.displayName} numberOfLines={1}>
            {item.displayName}{isMe ? ' (you)' : ''}
          </Text>
          {item.country ? (
            <Text style={styles.countryText}>{countryFlag(item.country)} {item.country}</Text>
          ) : null}
        </View>
        <Text style={styles.scoreText}>{item.bestScore.toLocaleString()}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#a5b4fc" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={styles.backButton} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'alltime' && styles.tabActive]}
          onPress={() => setTab('alltime')}
        >
          <Text style={[styles.tabText, tab === 'alltime' && styles.tabTextActive]}>All Time</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'weekly' && styles.tabActive]}
          onPress={() => setTab('weekly')}
        >
          <Text style={[styles.tabText, tab === 'weekly' && styles.tabTextActive]}>This Week</Text>
        </TouchableOpacity>
      </View>

      {/* Weekly reset countdown */}
      {tab === 'weekly' && (
        <View style={styles.countdownChip}>
          <Ionicons name="refresh-outline" size={13} color="#64748b" />
          <Text style={styles.countdownLabel}>Resets in</Text>
          <Text style={styles.countdownValue}>{formatCountdown(resetSecondsLeft)}</Text>
        </View>
      )}

      {/* Guest prompt */}
      {!user && (
        <View style={styles.guestContainer}>
          <Ionicons name="lock-closed-outline" size={48} color="#4b5563" />
          <Text style={styles.guestTitle}>Sign in to join</Text>
          <Text style={styles.guestSubtitle}>Create an account to compete on the leaderboard and track your ranking.</Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.85}
          >
            <Text style={styles.signInButtonText}>Sign In / Register</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {user && (
        <>
          {loading && (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#a5b4fc" />
            </View>
          )}

          {error && !loading && (
            <View style={styles.centered}>
              <Ionicons name="cloud-offline-outline" size={48} color="#4b5563" />
              <Text style={styles.errorText}>Failed to load leaderboard</Text>
              <TouchableOpacity style={styles.retryButton} onPress={load}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading && !error && (
            <FlatList
              data={entries}
              keyExtractor={(item) => item.uid}
              renderItem={renderEntry}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <View style={styles.centered}>
                  <Text style={styles.emptyText}>No entries yet. Be the first!</Text>
                </View>
              }
              ListFooterComponent={
                myEntry && myRank ? (() => {
                  const av = getAvatar(myEntry.avatarId, myEntry.uid);
                  return (
                    <>
                      <View style={styles.pinnedSeparator}>
                        <View style={styles.pinnedSeparatorLine} />
                        <Text style={styles.pinnedSeparatorText}>Your Position</Text>
                        <View style={styles.pinnedSeparatorLine} />
                      </View>
                      <View style={[styles.row, styles.rowHighlight]}>
                        <View style={styles.rankCell}>
                          <RankMedal rank={myRank} />
                        </View>
                        <View style={[styles.avatar, { backgroundColor: av.bg }]}>
                          <Text style={styles.avatarEmoji}>{av.emoji}</Text>
                        </View>
                        <View style={styles.nameCell}>
                          <Text style={styles.displayName} numberOfLines={1}>
                            {myEntry.displayName} (you)
                          </Text>
                          {myEntry.country ? (
                            <Text style={styles.countryText}>{countryFlag(myEntry.country)} {myEntry.country}</Text>
                          ) : null}
                        </View>
                        <Text style={styles.scoreText}>{myEntry.bestScore.toLocaleString()}</Text>
                      </View>
                    </>
                  );
                })() : null
              }
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050816',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
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
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabActive: {
    backgroundColor: '#1e293b',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#a5b4fc',
  },
  countdownChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  countdownLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  countdownValue: {
    fontSize: 12,
    color: '#a5b4fc',
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    gap: 10,
  },
  rowHighlight: {
    borderWidth: 1,
    borderColor: 'rgba(165,180,252,0.4)',
    backgroundColor: 'rgba(99,102,241,0.1)',
  },
  rankCell: {
    width: 36,
    alignItems: 'center',
  },
  medal: {
    fontSize: 22,
  },
  rankNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 20,
  },
  nameCell: {
    flex: 1,
    gap: 2,
  },
  displayName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f9fafb',
  },
  countryText: {
    fontSize: 11,
    color: '#64748b',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#22c55e',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  retryButton: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a5b4fc',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
  },
  pinnedSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  pinnedSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(165,180,252,0.15)',
  },
  pinnedSeparatorText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f9fafb',
    marginTop: 8,
  },
  guestSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
  signInButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    marginTop: 8,
  },
  signInButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
