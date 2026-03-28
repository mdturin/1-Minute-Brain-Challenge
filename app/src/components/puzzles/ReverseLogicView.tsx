import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Puzzle } from '../../logic/puzzles';
import OptionButton from '../OptionButton';

type Props = {
  puzzle: Puzzle;
  onAnswer: (isCorrect: boolean) => void;
};

export default function ReverseLogicView({ puzzle, onAnswer }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.promptBox}>
        <Text style={styles.promptIcon}>⚠️</Text>
        <Text style={styles.prompt}>{puzzle.prompt}</Text>
        <Text style={styles.sub}>3 are correct · 1 is wrong</Text>
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
  promptBox: {
    backgroundColor: '#1c0a00',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#f97316',
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 24,
    gap: 6,
  },
  promptIcon: {
    fontSize: 28,
  },
  prompt: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fb923c',
    textAlign: 'center',
  },
  sub: {
    fontSize: 13,
    color: '#7c3f00',
    fontWeight: '600',
  },
  optionsContainer: {
    gap: 12,
  },
});
