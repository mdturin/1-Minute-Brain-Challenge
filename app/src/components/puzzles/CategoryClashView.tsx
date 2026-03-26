import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Puzzle } from '../../logic/puzzles';
import OptionButton from '../OptionButton';

type Props = {
  puzzle: Puzzle;
  onAnswer: (isCorrect: boolean) => void;
};

export default function CategoryClashView({ puzzle, onAnswer }: Props) {
  const category = (puzzle.meta?.category as string) ?? '';

  return (
    <View style={styles.container}>
      <Text style={styles.typeLabel}>Category Clash</Text>

      <View style={styles.categoryBox}>
        <Text style={styles.categoryLabel}>Category</Text>
        <Text style={styles.categoryName}>{category}</Text>
        <Text style={styles.instruction}>Which does NOT belong?</Text>
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
  typeLabel: {
    fontSize: 14,
    color: '#a1a1aa',
    textAlign: 'center',
    marginBottom: 12,
  },
  categoryBox: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#6366f1',
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 24,
    alignItems: 'center',
    gap: 4,
  },
  categoryLabel: {
    fontSize: 11,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  categoryName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#a5b4fc',
    textAlign: 'center',
  },
  instruction: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
    fontWeight: '600',
  },
  optionsContainer: {
    gap: 12,
  },
});
