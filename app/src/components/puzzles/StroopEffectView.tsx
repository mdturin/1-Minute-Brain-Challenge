import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Puzzle } from '../../logic/puzzles';
import OptionButton from '../OptionButton';

type Props = {
  puzzle: Puzzle;
  onAnswer: (isCorrect: boolean) => void;
};

export default function StroopEffectView({ puzzle, onAnswer }: Props) {
  const inkColorHex = (puzzle.meta?.inkColorHex as string) ?? '#ffffff';
  const askInkColor = (puzzle.meta?.askInkColor as boolean) ?? true;
  const optionHexes = (puzzle.meta?.optionHexes as string[]) ?? [];

  const question = askInkColor
    ? 'What COLOR is the text written in?'
    : 'What WORD is written?';

  return (
    <View style={styles.container}>
      <Text style={styles.typeLabel}>Color-Word Conflict</Text>
      <Text style={styles.instruction}>{question}</Text>

      <View style={styles.wordBox}>
        <Text style={[styles.conflictWord, { color: inkColorHex }]}>
          {puzzle.prompt}
        </Text>
      </View>

      <Text style={styles.hint}>
        {askInkColor ? 'Ignore the word — name the INK color' : 'Read the word — ignore its color'}
      </Text>

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
  wordBox: {
    alignSelf: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#1e293b',
    paddingVertical: 24,
    paddingHorizontal: 40,
    marginBottom: 12,
  },
  conflictWord: {
    fontSize: 48,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 4,
  },
  hint: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
});
