import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Puzzle } from '../../logic/puzzles';
import OptionButton from '../OptionButton';

type Props = {
  puzzle: Puzzle;
  onAnswer: (isCorrect: boolean) => void;
};

export default function FakePatternView({ puzzle, onAnswer }: Props) {
  // Split "2, 4, 8, 16, ?" into individual tokens
  const parts = puzzle.prompt.split(', ');

  return (
    <View style={styles.container}>
      <Text style={styles.typeLabel}>Fake Pattern Trap</Text>
      <Text style={styles.instruction}>What comes next?</Text>
      <View style={styles.sequenceRow}>
        {parts.map((part, i) => (
          <View key={i} style={[styles.numBox, part === '?' && styles.numBoxQuestion]}>
            <Text style={[styles.numText, part === '?' && styles.questionMark]}>{part}</Text>
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
    marginBottom: 8,
  },
  instruction: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  sequenceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 28,
  },
  numBox: {
    minWidth: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#1e1b4b',
    borderWidth: 1,
    borderColor: '#4338ca',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  numBoxQuestion: {
    backgroundColor: '#3730a3',
    borderColor: '#818cf8',
    borderWidth: 2,
  },
  numText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#a5b4fc',
  },
  questionMark: {
    color: '#e0e7ff',
    fontSize: 22,
  },
  optionsContainer: {
    gap: 12,
  },
});
