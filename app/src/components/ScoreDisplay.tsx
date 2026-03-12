import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  score: number;
  streak: number;
};

export default function ScoreDisplay({ score, streak }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.scoreBlock}>
        <Text style={styles.label}>Score</Text>
        <Text style={styles.scoreValue}>{score}</Text>
      </View>
      <View style={styles.scoreBlock}>
        <Text style={styles.label}>Streak</Text>
        <Text style={styles.streakValue}>{streak}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#18181b',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  scoreBlock: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#a1a1aa',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#22c55e',
  },
  streakValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#60a5fa',
  },
});

