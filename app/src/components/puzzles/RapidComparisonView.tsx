import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Puzzle } from '../../logic/puzzles';
import OptionButton from '../OptionButton';

type Props = {
  puzzle: Puzzle;
  onAnswer: (isCorrect: boolean) => void;
};

export default function RapidComparisonView({ puzzle, onAnswer }: Props) {
  const questionWord = (puzzle.meta?.questionWord as string) ?? 'BIGGER';
  // prompt is "A  vs  B"
  const [leftVal, rightVal] = puzzle.prompt.split('  vs  ');

  return (
    <View style={styles.container}>
      <Text style={styles.typeLabel}>Rapid Comparison</Text>
      <Text style={styles.instruction}>
        Which is <Text style={styles.keyword}>{questionWord}</Text>?
      </Text>

      <View style={styles.compRow}>
        <View style={styles.valueBox}>
          <Text style={styles.valueText}>{leftVal}</Text>
        </View>
        <Text style={styles.vsText}>vs</Text>
        <View style={styles.valueBox}>
          <Text style={styles.valueText}>{rightVal}</Text>
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
  typeLabel: {
    fontSize: 14,
    color: '#a1a1aa',
    textAlign: 'center',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 18,
    color: '#94a3b8',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  keyword: {
    color: '#fbbf24',
    fontWeight: '800',
  },
  compRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  valueBox: {
    flex: 1,
    backgroundColor: '#1e1b4b',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#6366f1',
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  valueText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#a5b4fc',
    textAlign: 'center',
  },
  vsText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '700',
  },
  optionsContainer: {
    gap: 12,
  },
});
