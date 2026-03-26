import type { Puzzle } from './types';
import type { Difficulty } from '../difficulty';

function randomInt(min: number, max: number, rng?: () => number): number {
  return Math.floor((rng ?? Math.random)() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[], rng?: () => number): T[] {
  return [...arr].sort(() => (rng ?? Math.random)() - 0.5);
}

type SymbolPair = {
  target: string;
  distractor: string;
  targetName: string;
};

const SYMBOL_PAIRS: SymbolPair[] = [
  { target: '⭐', distractor: '⚪', targetName: 'stars' },
  { target: '🔴', distractor: '🔵', targetName: 'red circles' },
  { target: '▲', distractor: '■', targetName: 'triangles' },
  { target: '♦', distractor: '♣', targetName: 'diamonds' },
  { target: '●', distractor: '○', targetName: 'filled circles' },
];

export function generateCountDistractionPuzzle(difficulty: Difficulty, rng?: () => number): Puzzle {
  const pair = SYMBOL_PAIRS[randomInt(0, SYMBOL_PAIRS.length - 1, rng)]!;

  const gridSize = difficulty === 'easy' ? 12 : difficulty === 'medium' ? 16 : 20;
  const targetCount = randomInt(
    difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5,
    difficulty === 'easy' ? 6 : difficulty === 'medium' ? 8 : 10,
    rng,
  );
  const distractorCount = gridSize - targetCount;

  const symbols = shuffle(
    [...Array(targetCount).fill(pair.target), ...Array(distractorCount).fill(pair.distractor)],
    rng,
  );

  const distractors = new Set<number>();
  for (let offset = 1; distractors.size < 3; offset++) {
    if (targetCount - offset > 0) distractors.add(targetCount - offset);
    if (distractors.size < 3) distractors.add(targetCount + offset);
  }

  const allOptions = shuffle([targetCount, ...[...distractors].slice(0, 3)], rng);
  const correctIndex = allOptions.indexOf(targetCount);

  return {
    type: 'count_distraction',
    prompt: symbols.join(' '),
    options: allOptions.map(String),
    correctIndex,
    meta: {
      targetSymbol: pair.target,
      distractorSymbol: pair.distractor,
      targetName: pair.targetName,
      symbols,
      gridSize,
    },
  };
}
