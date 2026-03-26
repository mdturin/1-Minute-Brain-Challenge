import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Puzzle } from '../../logic/puzzles';
import OptionButton from '../OptionButton';

type Props = {
  puzzle: Puzzle;
  onAnswer: (isCorrect: boolean) => void;
};

// Split prompt like "Tap the LARGEST number" into prefix + keyword + suffix
function splitPrompt(prompt: string): { before: string; keyword: string; after: string } {
  const match = prompt.match(/^(.*?)([A-Z][A-Z\s]+[A-Z0-9])(.*)$/);
  if (!match) return { before: '', keyword: prompt, after: '' };
  return { before: match[1] ?? '', keyword: match[2] ?? '', after: match[3] ?? '' };
}

export default function InstructionFlipView({ puzzle, onAnswer }: Props) {
  const { before, keyword, after } = splitPrompt(puzzle.prompt);

  return (
    <View style={styles.container}>
      <Text style={styles.typeLabel}>Instruction Flip</Text>
      <View style={styles.ruleBox}>
        <Text style={styles.rulePre}>{before}</Text>
        <Text style={styles.ruleKeyword}>{keyword}</Text>
        <Text style={styles.rulePre}>{after}</Text>
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
  ruleBox: {
    backgroundColor: '#1e1b4b',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#6366f1',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 28,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
  },
  rulePre: {
    fontSize: 20,
    fontWeight: '600',
    color: '#94a3b8',
  },
  ruleKeyword: {
    fontSize: 26,
    fontWeight: '900',
    color: '#a5b4fc',
    letterSpacing: 1,
  },
  optionsContainer: {
    gap: 12,
  },
});
