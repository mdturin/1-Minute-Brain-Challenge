import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  progress: number;
  remainingSeconds: number;
};

export default function TimerBar({ progress, remainingSeconds }: Props) {
  const clampedProgress = Math.max(0, Math.min(1, progress));

  let barColor = '#22c55e';
  if (clampedProgress < 0.33) {
    barColor = '#ef4444';
  } else if (clampedProgress < 0.66) {
    barColor = '#eab308';
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Time Left</Text>
        <Text style={styles.value}>{remainingSeconds}s</Text>
      </View>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${clampedProgress * 100}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: '#a1a1aa',
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f4f4f5',
  },
  barBackground: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#27272a',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },
});

