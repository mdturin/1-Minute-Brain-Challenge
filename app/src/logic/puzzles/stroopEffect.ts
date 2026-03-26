import type { Puzzle } from './types';
import type { Difficulty } from '../difficulty';

function randomInt(min: number, max: number, rng?: () => number): number {
  return Math.floor((rng ?? Math.random)() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[], rng?: () => number): T[] {
  return [...arr].sort(() => (rng ?? Math.random)() - 0.5);
}

const COLORS = [
  { name: 'RED', hex: '#ef4444' },
  { name: 'BLUE', hex: '#3b82f6' },
  { name: 'GREEN', hex: '#22c55e' },
  { name: 'YELLOW', hex: '#eab308' },
  { name: 'PURPLE', hex: '#a855f7' },
  { name: 'ORANGE', hex: '#f97316' },
];

export function generateStroopEffectPuzzle(difficulty: Difficulty, rng?: () => number): Puzzle {
  const colorPool = difficulty === 'easy' ? COLORS.slice(0, 4) : COLORS;

  // Pick the ink color (what the text is displayed in)
  const inkColorIdx = randomInt(0, colorPool.length - 1, rng);
  const inkColor = colorPool[inkColorIdx]!;

  // Pick the word (must differ from ink color — that's the "conflict")
  let wordColorIdx = randomInt(0, colorPool.length - 1, rng);
  while (wordColorIdx === inkColorIdx) {
    wordColorIdx = randomInt(0, colorPool.length - 1, rng);
  }
  const wordColor = colorPool[wordColorIdx]!;

  // On easy: ask for the word text (easier — less conflict).
  // On medium/hard: ask for the ink color (harder — resist reading the word).
  const askInkColor = difficulty !== 'easy';

  const correctColor = askInkColor ? inkColor : wordColor;

  // Build 3 distractors (other colors, not the correct one)
  const distractorColors = colorPool
    .filter((c) => c.name !== correctColor.name)
    .slice(0, 3);

  const allOptions = shuffle([correctColor, ...distractorColors], rng);
  const correctIndex = allOptions.findIndex((c) => c.name === correctColor.name);

  return {
    type: 'stroop_effect',
    prompt: wordColor.name,
    options: allOptions.map((c) => c.name),
    correctIndex,
    meta: {
      inkColorHex: inkColor.hex,
      inkColorName: inkColor.name,
      wordColorName: wordColor.name,
      askInkColor,
      optionHexes: allOptions.map((c) => c.hex),
    },
  };
}
