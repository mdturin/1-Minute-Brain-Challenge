import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Puzzle } from '../../logic/puzzles';
import PrimaryButton from '../PrimaryButton';

type Props = {
  puzzle: Puzzle;
  onAnswer: (isCorrect: boolean) => void;
};

export default function SymbolCountView({ puzzle, onAnswer }: Props) {
  // Split "How many ★ are in the grid?\n\n<grid>" into question + grid
  const parts = puzzle.prompt.split('\n\n');
  const question = parts[0] ?? puzzle.prompt;
  const grid = parts.slice(1).join('\n\n');

  return (
    <View style={styles.container}>
      <Text style={styles.typeLabel}>Symbol Count</Text>
      <Text style={styles.question}>{question}</Text>
      {grid ? (
        <View style={styles.gridBox}>
          <Text style={styles.gridText}>{grid}</Text>
        </View>
      ) : null}
      <View style={styles.optionsContainer}>
        {puzzle.options.map((option, index) => (
          <PrimaryButton
            key={option + index.toString()}
            label={option}
            onPress={() => onAnswer(index === puzzle.correctIndex)}
            style={styles.optionButton}
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
    marginBottom: 8,
  },
  question: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f4f4f5',
    textAlign: 'center',
    marginBottom: 16,
  },
  gridBox: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.15)',
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  gridText: {
    fontSize: 22,
    color: '#f4f4f5',
    lineHeight: 36,
    textAlign: 'center',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    width: '100%',
  },
});
