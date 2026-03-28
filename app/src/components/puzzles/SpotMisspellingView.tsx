import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Puzzle } from '../../logic/puzzles';
import OptionButton from '../OptionButton';

type Props = {
  puzzle: Puzzle;
  onAnswer: (isCorrect: boolean) => void;
};

export default function SpotMisspellingView({ puzzle, onAnswer }: Props) {
  return (
    <View style={styles.container}>

      <View style={styles.promptBox}>
        <Text style={styles.promptIcon}>🔍</Text>
        <Text style={styles.promptText}>{puzzle.prompt}</Text>
        <Text style={styles.subText}>3 are correct · 1 is wrong</Text>
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
    backgroundColor: '#1c0f00',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f97316',
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
    gap: 6,
  },
  promptIcon: {
    fontSize: 28,
  },
  promptText: {
    fontSize: 17,
    color: '#fed7aa',
    fontWeight: '700',
    textAlign: 'center',
  },
  subText: {
    fontSize: 12,
    color: '#92400e',
    marginTop: 2,
  },
  optionsContainer: {
    gap: 12,
  },
});
