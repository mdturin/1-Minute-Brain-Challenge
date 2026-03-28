import type { Puzzle } from './types';
import type { Difficulty } from '../difficulty';

function randomInt(min: number, max: number, rng?: () => number): number {
  return Math.floor((rng ?? Math.random)() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[], rng?: () => number): T[] {
  return [...arr].sort(() => (rng ?? Math.random)() - 0.5);
}

type GoNoGoRule = {
  name: string;
  tapLabel: string;        // what to tap
  ignoreLabel: string;     // what to ignore
  isTarget: (n: number) => boolean;
};

const RULES: GoNoGoRule[] = [
  {
    name: 'even',
    tapLabel: 'EVEN numbers',
    ignoreLabel: 'ODD numbers',
    isTarget: (n) => n % 2 === 0,
  },
  {
    name: 'odd',
    tapLabel: 'ODD numbers',
    ignoreLabel: 'EVEN numbers',
    isTarget: (n) => n % 2 !== 0,
  },
  {
    name: 'greater_than_50',
    tapLabel: 'numbers > 50',
    ignoreLabel: 'numbers ≤ 50',
    isTarget: (n) => n > 50,
  },
  {
    name: 'less_than_50',
    tapLabel: 'numbers < 50',
    ignoreLabel: 'numbers ≥ 50',
    isTarget: (n) => n < 50,
  },
  {
    name: 'divisible_by_3',
    tapLabel: 'multiples of 3',
    ignoreLabel: 'non-multiples of 3',
    isTarget: (n) => n % 3 === 0,
  },
];

export function generateGoNoGoPuzzle(difficulty: Difficulty, rng?: () => number): Puzzle {
  // greater_than_50 and less_than_50 require range > 50 to have a usable pool
  // of both targets and non-targets — they only work correctly at hard (range 99).
  // Medium uses divisible_by_3 instead to keep variety without empty pools.
  const availableRules =
    difficulty === 'easy'
      ? [RULES[0]!, RULES[1]!]
      : difficulty === 'medium'
        ? [RULES[0]!, RULES[1]!, RULES[4]!]
        : RULES;

  const rule = availableRules[randomInt(0, availableRules.length - 1, rng)]!;

  const range = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 50 : 99;
  const gridSize = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 9 : 12;

  // Build explicit pools first, then slice — no rejection-sampling loop that
  // could spin forever when the valid candidate set is smaller than needed.
  const allNums = Array.from({ length: range }, (_, i) => i + 1);
  const targetPool = shuffle(allNums.filter((n) => rule.isTarget(n)), rng);
  const nonTargetPool = shuffle(allNums.filter((n) => !rule.isTarget(n)), rng);

  const targetCount = Math.floor(gridSize * 0.4); // ~40% are targets
  const pickedTargets = targetPool.slice(0, targetCount);
  const pickedNonTargets = nonTargetPool.slice(0, gridSize - pickedTargets.length);

  const shuffledNumbers = shuffle([...pickedTargets, ...pickedNonTargets], rng);

  // The puzzle asks: "How many TARGET numbers are in this grid?"
  const targetNumbers = shuffledNumbers.filter((n) => rule.isTarget(n));
  const correctAnswer = targetNumbers.length;

  // Build options: correct + 3 nearby distractors
  const distractors = new Set<number>();
  for (let offset = 1; distractors.size < 3; offset++) {
    if (correctAnswer - offset >= 0) distractors.add(correctAnswer - offset);
    if (distractors.size < 3) distractors.add(correctAnswer + offset);
  }

  const allOptions = shuffle([correctAnswer, ...[...distractors].slice(0, 3)], rng);
  const correctIndex = allOptions.indexOf(correctAnswer);

  return {
    type: 'go_no_go',
    prompt: shuffledNumbers.join(', '),
    options: allOptions.map(String),
    correctIndex,
    meta: {
      ruleName: rule.name,
      tapLabel: rule.tapLabel,
      ignoreLabel: rule.ignoreLabel,
      gridSize,
      numbers: shuffledNumbers,
    },
  };
}
