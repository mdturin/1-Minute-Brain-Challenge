import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Puzzle } from '../../logic/puzzles';
import OptionButton from '../OptionButton';

type Props = {
  puzzle: Puzzle;
  onAnswer: (isCorrect: boolean) => void;
};

export default function VisualRotationView({ puzzle, onAnswer }: Props) {
  const isMultiLine = puzzle.prompt.includes('\n');

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>Which rotation matches this?</Text>

      <View style={styles.sourceBox}>
        {isMultiLine ? (
          <Text style={styles.sourceShapeGrid}>{puzzle.prompt}</Text>
        ) : (
          <Text style={styles.sourceShape}>{puzzle.prompt}</Text>
        )}
      </View>

      <Text style={styles.subLabel}>Choose the correct rotation:</Text>

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
  instruction: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  sourceBox: {
    alignSelf: 'center',
    backgroundColor: '#1e1b4b',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#6366f1',
    paddingHorizontal: 28,
    paddingVertical: 20,
    marginBottom: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  sourceShape: {
    fontSize: 52,
    color: '#a5b4fc',
    textAlign: 'center',
  },
  sourceShapeGrid: {
    fontSize: 18,
    color: '#a5b4fc',
    fontFamily: 'monospace',
    textAlign: 'center',
    lineHeight: 26,
  },
  subLabel: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 14,
  },
  optionsContainer: {
    gap: 12,
  },
});
