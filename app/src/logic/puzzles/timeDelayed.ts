import type { Puzzle } from './types';
import type { Difficulty } from '../difficulty';

function randomInt(min: number, max: number, rng?: () => number): number {
  return Math.floor((rng ?? Math.random)() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[], rng?: () => number): T[] {
  return [...arr].sort(() => (rng ?? Math.random)() - 0.5);
}

const POSITION_LABELS = ['1st', '2nd', '3rd', '4th', '5th'];

export function generateTimeDelayedPuzzle(difficulty: Difficulty, rng?: () => number): Puzzle {
  let count: number;  // how many numbers to show
  let targetPos: number; // which position to ask about (0-indexed)
  let numMin: number, numMax: number;

  switch (difficulty) {
    case 'easy':
      count = 3; numMin = 1; numMax = 9;
      break;
    case 'medium':
      count = 4; numMin = 10; numMax = 99;
      break;
    case 'hard':
    default:
      count = 5; numMin = 10; numMax = 99;
      break;
  }

  // Generate unique numbers for the sequence
  const set = new Set<number>();
  while (set.size < count) set.add(randomInt(numMin, numMax, rng));
  const sequence = Array.from(set);

  // Pick which position to ask about
  targetPos = randomInt(0, count - 1, rng);
  const correctAnswer = sequence[targetPos]!;

  // Build distractors: nearby values, different from correctAnswer and each other
  const distractorSet = new Set<number>();
  let att = 0;
  while (distractorSet.size < 3 && att < 200) {
    const delta = randomInt(1, 10, rng) * ((rng ?? Math.random)() > 0.5 ? 1 : -1);
    const candidate = correctAnswer + delta;
    if (candidate !== correctAnswer && candidate >= numMin - 5 && !distractorSet.has(candidate)) {
      distractorSet.add(candidate);
    }
    att++;
  }
  const distractors = Array.from(distractorSet);

  // Shuffle options
  const shuffled = shuffle([correctAnswer, ...distractors], rng);
  const correctIndex = shuffled.indexOf(correctAnswer);

  const posLabel = POSITION_LABELS[targetPos] ?? `${targetPos + 1}th`;

  return {
    type: 'time_delayed',
    prompt: `What was the ${posLabel} number?`,
    options: shuffled.map(String),
    correctIndex,
    meta: {
      sequence,
      targetPos,
      showDurationMs: difficulty === 'easy' ? 2500 : difficulty === 'medium' ? 2000 : 1500,
    },
  };
}
