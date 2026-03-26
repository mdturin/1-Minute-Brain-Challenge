import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Puzzle } from '../../logic/puzzles';
import OptionButton from '../OptionButton';

type Props = {
  puzzle: Puzzle;
  onAnswer: (isCorrect: boolean) => void;
};

// Renders step text, coloring ■ in amber to distinguish it from ?
function renderStepText(text: string) {
  const parts = text.split('■');
  if (parts.length === 1) return <Text style={styles.stepText}>{text}</Text>;
  return (
    <Text style={styles.stepText}>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {i < parts.length - 1 && <Text style={styles.carrySymbol}>■</Text>}
        </React.Fragment>
      ))}
    </Text>
  );
}

export default function MultiStepView({ puzzle, onAnswer }: Props) {
  const lines = puzzle.prompt.split('\n');
  const step1 = lines[0] ?? '';
  const step2 = lines[1] ?? '';

  return (
    <View style={styles.container}>
      <Text style={styles.typeLabel}>Multi-Step</Text>
      <View style={styles.stepsBox}>
        <View style={styles.stepRow}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepNum}>A</Text>
          </View>
          <Text style={styles.stepText}>{renderStepText(step1.replace('Step 1: ', ''))}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stepRow}>
          <View style={[styles.stepBadge, styles.stepBadge2]}>
            <Text style={styles.stepNum}>B</Text>
          </View>
          <Text style={styles.stepText}>{renderStepText(step2.replace('Step 2: ', ''))}</Text>
        </View>
      </View>
      <Text style={styles.question}>What is the final answer?</Text>
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
  stepsBox: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.15)',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 0,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(148,163,184,0.1)',
    marginHorizontal: 4,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadge2: {
    backgroundColor: '#7c3aed',
  },
  stepNum: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
  },
  stepText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f4f4f5',
    flex: 1,
  },
  carrySymbol: {
    color: '#fbbf24',
    fontWeight: '900',
  },
  question: {
    fontSize: 16,
    color: '#818cf8',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 12,
  },
});
