import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Puzzle } from '../../logic/puzzles';
import OptionButton from '../OptionButton';

type Props = {
  puzzle: Puzzle;
  onAnswer: (isCorrect: boolean) => void;
};

export default function WordScrambleView({ puzzle, onAnswer }: Props) {
  // Split prompt into label line and the scrambled word
  const lines = puzzle.prompt.split('\n\n');
  const instruction = lines[0] ?? puzzle.prompt;
  const scrambledWord = lines[1] ?? '';

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>{instruction}</Text>
      {scrambledWord ? (
        <View style={styles.scrambledBox}>
          <Text style={styles.scrambledWord}>{scrambledWord}</Text>
        </View>
      ) : null}
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
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  scrambledBox: {
    backgroundColor: 'rgba(99,102,241,0.12)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(165,180,252,0.25)',
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  scrambledWord: {
    fontSize: 32,
    fontWeight: '800',
    color: '#a5b4fc',
    letterSpacing: 6,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 12,
  },
});
