import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Puzzle } from '../../logic/puzzles';
import OptionButton from '../OptionButton';

type Props = {
  puzzle: Puzzle;
  onAnswer: (isCorrect: boolean) => void;
};

const FLASH_DURATION_MS = 750;

export default function DualTaskView({ puzzle, onAnswer }: Props) {
  const colors = (puzzle.meta?.colors as string[]) ?? [];
  const colorHex = (puzzle.meta?.colorHex as Record<string, string>) ?? {};

  const [colorIndex, setColorIndex] = useState(0);
  const [phase, setPhase] = useState<'flashing' | 'answering'>('flashing');

  useEffect(() => {
    if (phase !== 'flashing') return;
    const timer = setTimeout(() => {
      if (colorIndex >= colors.length - 1) {
        setPhase('answering');
      } else {
        setColorIndex((i) => i + 1);
      }
    }, FLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [phase, colorIndex, colors.length]);

  const currentColor = colors[colorIndex];
  const currentHex = currentColor ? (colorHex[currentColor] ?? '#6366f1') : '#6366f1';

  if (phase === 'flashing') {
    return (
      <View style={styles.container}>
        <Text style={styles.hint}>Solve the math AND remember the last color!</Text>
        <Text style={styles.mathPrompt}>{puzzle.prompt}</Text>
        <View style={[styles.colorCircle, { backgroundColor: currentHex }]} />
        <Text style={[styles.colorName, { color: currentHex }]}>{currentColor}</Text>
        <View style={styles.progressRow}>
          {colors.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i <= colorIndex && { backgroundColor: colorHex[colors[i]!] ?? '#6366f1' }]}
            />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.questionRow}>
        <View style={styles.questionBox}>
          <Text style={styles.questionLabel}>Math</Text>
          <Text style={styles.mathPrompt}>{puzzle.prompt}</Text>
        </View>
        <View style={styles.questionBox}>
          <Text style={styles.questionLabel}>Last Color</Text>
          <Text style={styles.lastColorHint}>What was it?</Text>
        </View>
      </View>
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
  hint: {
    fontSize: 13,
    color: '#818cf8',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  mathPrompt: {
    fontSize: 36,
    fontWeight: '800',
    color: '#f4f4f5',
    textAlign: 'center',
    marginBottom: 28,
  },
  colorCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 14,
  },
  colorName: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#374151',
  },
  questionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  questionBox: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.15)',
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  questionLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 1,
  },
  lastColorHint: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '600',
  },
  optionsContainer: {
    gap: 12,
  },
});
