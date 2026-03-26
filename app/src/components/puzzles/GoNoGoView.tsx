import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Puzzle } from '../../logic/puzzles';
import OptionButton from '../OptionButton';

type Props = {
  puzzle: Puzzle;
  onAnswer: (isCorrect: boolean) => void;
};

export default function GoNoGoView({ puzzle, onAnswer }: Props) {
  const tapLabel = (puzzle.meta?.tapLabel as string) ?? 'target numbers';
  const numbers = (puzzle.meta?.numbers as number[]) ?? puzzle.prompt.split(', ').map(Number);

  return (
    <View style={styles.container}>
      <Text style={styles.typeLabel}>Go / No-Go</Text>

      <View style={styles.ruleBox}>
        <Text style={styles.ruleAction}>
          Count <Text style={styles.ruleKeyword}>{tapLabel}</Text>
        </Text>
        <Text style={styles.ruleSubtext}>How many are there?</Text>
      </View>

      <View style={styles.grid}>
        {numbers.map((n, i) => (
          <View key={i} style={styles.numCell}>
            <Text style={styles.numText}>{n}</Text>
          </View>
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
    backgroundColor: '#0f1f0f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 18,
    alignItems: 'center',
  },
  ruleAction: {
    fontSize: 16,
    color: '#86efac',
    fontWeight: '600',
    textAlign: 'center',
  },
  ruleKeyword: {
    color: '#4ade80',
    fontWeight: '800',
  },
  ruleSubtext: {
    fontSize: 13,
    color: '#6ee7b7',
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 22,
  },
  numCell: {
    width: 52,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#1e1b4b',
    borderWidth: 1,
    borderColor: '#4338ca',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#a5b4fc',
  },
  optionsContainer: {
    gap: 12,
  },
});
