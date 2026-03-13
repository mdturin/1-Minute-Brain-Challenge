import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Puzzle } from '../../logic/puzzles';
import PrimaryButton from '../PrimaryButton';

type Props = {
  puzzle: Puzzle;
  onAnswer: (isCorrect: boolean) => void;
};

export default function PatternVisualView({ puzzle, onAnswer }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.typeLabel}>Visual Pattern</Text>
      <Text style={styles.prompt}>{puzzle.prompt}</Text>
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
  prompt: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f4f4f5',
    textAlign: 'center',
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    width: '100%',
  },
});

