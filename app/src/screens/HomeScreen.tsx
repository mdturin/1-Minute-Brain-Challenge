import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import PrimaryButton from '../components/PrimaryButton';
import { DIFFICULTIES, orderedDifficulties } from '../logic/difficulty';
import { loadStats } from '../storage/stats';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [bestScore, setBestScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [averageScore, setAverageScore] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      const stats = await loadStats();
      setBestScore(stats.bestScore);
      setGamesPlayed(stats.gamesPlayed);
      setAverageScore(stats.gamesPlayed > 0 ? Math.round(stats.totalScore / stats.gamesPlayed) : 0);
      setLoading(false);
    };

    fetchStats();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>1 Minute Brain Challenge</Text>
          <Text style={styles.subtitle}>You have 60 seconds. Answer as many mini-puzzles as you can.</Text>
        </View>

        <View style={styles.center}>
          {orderedDifficulties.map((key) => {
            const config = DIFFICULTIES[key];
            return (
              <View key={config.key} style={styles.modeCard}>
                <Text style={styles.modeLabel}>{config.label}</Text>
                <Text style={styles.modeAge}>{config.ageRangeLabel}</Text>
                <Text style={styles.modeDescription}>{config.description}</Text>
                <PrimaryButton
                  label={`Play ${config.label}`}
                  onPress={() => navigation.navigate('Game', { difficulty: config.key })}
                />
              </View>
            );
          })}
        </View>

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
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#050816',
  },
  header: {
    marginTop: 32,
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: 16,
  },
  modeCard: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 12,
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

