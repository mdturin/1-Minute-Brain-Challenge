import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Puzzle } from '../../logic/puzzles';
import OptionButton from '../OptionButton';

type Props = {
  puzzle: Puzzle;
  onAnswer: (isCorrect: boolean) => void;
};

export default function CountDistractionView({ puzzle, onAnswer }: Props) {
  const targetSymbol = (puzzle.meta?.targetSymbol as string) ?? '⭐';
  const distractorSymbol = (puzzle.meta?.distractorSymbol as string) ?? '⚪';
  const targetName = (puzzle.meta?.targetName as string) ?? 'stars';
  const symbols = (puzzle.meta?.symbols as string[]) ?? puzzle.prompt.split(' ');

  return (
    <View style={styles.container}>
      <Text style={styles.typeLabel}>Count with Distraction</Text>

      <View style={styles.ruleBox}>
        <Text style={styles.ruleText}>
          Count <Text style={styles.targetSymbol}>{targetSymbol}</Text>{' '}
          <Text style={styles.targetName}>{targetName}</Text>
        </Text>
        <Text style={styles.ignoreText}>
          Ignore <Text style={styles.distractorSymbol}>{distractorSymbol}</Text>
        </Text>
      </View>

      <View style={styles.grid}>
        {symbols.map((sym, i) => (
          <Text key={i} style={[styles.symbol, sym === targetSymbol && styles.targetHighlight]}>
            {sym}
          </Text>
        ))}
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
    marginBottom: 10,
  },
  ruleBox: {
    backgroundColor: '#1c1700',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eab308',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  ruleText: {
    fontSize: 16,
    color: '#fef08a',
    fontWeight: '600',
  },
  targetSymbol: {
    fontSize: 18,
  },
  targetName: {
    color: '#fde047',
    fontWeight: '800',
  },
  ignoreText: {
    fontSize: 13,
    color: '#a16207',
    marginTop: 2,
  },
  distractorSymbol: {
    fontSize: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  symbol: {
    fontSize: 24,
    opacity: 0.5,
  },
  targetHighlight: {
    opacity: 1,
  },
  optionsContainer: {
    gap: 12,
  },
});
