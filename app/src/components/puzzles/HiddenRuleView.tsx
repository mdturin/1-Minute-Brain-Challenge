import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Puzzle } from '../../logic/puzzles';
import OptionButton from '../OptionButton';

type Props = {
  puzzle: Puzzle;
  onAnswer: (isCorrect: boolean) => void;
};

export default function HiddenRuleView({ puzzle, onAnswer }: Props) {
  // Parse "CAT→3, FISH→4, APPLE→5, CLOUD→?" into pairs
  const parts = puzzle.prompt.split(', ');
  const pairs = parts.map((p) => {
    const [word, val] = p.split('→');
    return { word: word ?? '', val: val ?? '?' };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.typeLabel}>Hidden Rule</Text>
      <Text style={styles.instruction}>Find the pattern. What comes next?</Text>

      <View style={styles.pairsContainer}>
        {pairs.map((pair, i) => (
          <View key={i} style={[styles.pairRow, pair.val === '?' && styles.pairRowMystery]}>
            <Text style={[styles.wordText, pair.val === '?' && styles.wordTextMystery]}>
              {pair.word}
            </Text>
            <Text style={styles.arrow}>→</Text>
            <View style={[styles.valueBox, pair.val === '?' && styles.valueBoxMystery]}>
              <Text style={[styles.valueText, pair.val === '?' && styles.questionMark]}>
                {pair.val}
              </Text>
            </View>
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
  pairsContainer: {
    gap: 8,
    marginBottom: 24,
  },
  pairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e1b4b',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#3730a3',
    gap: 12,
  },
  pairRowMystery: {
    backgroundColor: '#312e81',
    borderColor: '#818cf8',
    borderWidth: 2,
  },
  wordText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#a5b4fc',
    minWidth: 80,
    textAlign: 'right',
    letterSpacing: 1,
  },
  wordTextMystery: {
    color: '#e0e7ff',
  },
  arrow: {
    fontSize: 18,
    color: '#6366f1',
    fontWeight: '700',
  },
  valueBox: {
    minWidth: 44,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#4338ca',
  },
  valueBoxMystery: {
    backgroundColor: '#4338ca',
    borderColor: '#818cf8',
  },
  valueText: {
    fontSize: 18,
    fontWeight: '800',
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
