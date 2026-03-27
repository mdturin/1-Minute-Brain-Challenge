import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Puzzle } from '../../logic/puzzles';
import OptionButton from '../OptionButton';

type Props = {
  puzzle: Puzzle;
  onAnswer: (isCorrect: boolean) => void;
};

export default function TimeDelayedView({ puzzle, onAnswer }: Props) {
  const sequence = (puzzle.meta?.sequence as number[]) ?? [];
  const showDurationMs = (puzzle.meta?.showDurationMs as number) ?? 2000;

  const [phase, setPhase] = useState<'showing' | 'hidden' | 'answering'>('showing');
  const [countdown, setCountdown] = useState(Math.ceil(showDurationMs / 1000));
  const countdownRef = useRef(Math.ceil(showDurationMs / 1000));

  // Phase 1: show sequence, countdown
  useEffect(() => {
    if (phase !== 'showing') return;
    countdownRef.current = Math.ceil(showDurationMs / 1000);
    const interval = setInterval(() => {
      countdownRef.current -= 1;
      setCountdown(countdownRef.current);
      if (countdownRef.current <= 0) {
        clearInterval(interval);
        setPhase('hidden');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, showDurationMs]);

  // Phase 2: brief "hidden" flash before answering
  useEffect(() => {
    if (phase !== 'hidden') return;
    const t = setTimeout(() => setPhase('answering'), 600);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === 'showing') {
    return (
      <View style={styles.container}>
        <Text style={styles.typeLabel}>Time Delayed</Text>
        <Text style={styles.instruction}>Memorise these numbers!</Text>
        <View style={styles.sequenceRow}>
          {sequence.map((n, i) => (
            <View key={i} style={styles.numBox}>
              <Text style={styles.numText}>{n}</Text>
            </View>
          ))}
        </View>
        <View style={styles.countdownBox}>
          <Text style={styles.countdownText}>{countdown}s</Text>
        </View>
      </View>
    );
  }

  if (phase === 'hidden') {
    return (
      <View style={styles.container}>
        <Text style={styles.typeLabel}>Time Delayed</Text>
        <View style={styles.sequenceRow}>
          {sequence.map((_, i) => (
            <View key={i} style={[styles.numBox, styles.numBoxHidden]}>
              <Text style={styles.hiddenText}>?</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.typeLabel}>Time Delayed</Text>
      <View style={styles.sequenceRow}>
        {sequence.map((_, i) => (
          <View key={i} style={[styles.numBox, styles.numBoxHidden]}>
            <Text style={styles.hiddenText}>?</Text>
          </View>
        ))}
      </View>
      <Text style={styles.question}>{puzzle.prompt}</Text>
      <View style={styles.optionsContainer}>
        {puzzle.options.map((option, index) => (
          <OptionButton
            key={option + index.toString()}
            label={option}
            index={index}
            onPress={() => onAnswer(index === puzzle.correctIndex)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  typeLabel: {
    fontSize: 14,
    color: '#a1a1aa',
    textAlign: 'center',
    marginBottom: 12,
  },
  instruction: {
    fontSize: 16,
    color: '#818cf8',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  sequenceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  numBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#1e1b4b',
    borderWidth: 2,
    borderColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBoxHidden: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  numText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#a5b4fc',
  },
  hiddenText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#475569',
  },
  countdownBox: {
    alignSelf: 'center',
    backgroundColor: 'rgba(99,102,241,0.15)',
    borderRadius: 50,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  countdownText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#6366f1',
  },
  question: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f4f4f5',
    textAlign: 'center',
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
});
