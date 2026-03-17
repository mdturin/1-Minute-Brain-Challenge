import type { Puzzle } from './types';
import type { Difficulty } from '../difficulty';

type LogicPattern = {
  sequence: number[];
  correct: number;
};

// ─── EASY ─────────────────────────────────────────────────────────────────────
// Simple arithmetic progressions — increasing and decreasing, small numbers
const easyPatterns: LogicPattern[] = [
  // Increasing by 1
  { sequence: [1, 2, 3], correct: 4 },
  { sequence: [4, 5, 6], correct: 7 },
  { sequence: [7, 8, 9], correct: 10 },
  { sequence: [12, 13, 14], correct: 15 },
  // Increasing by 2
  { sequence: [2, 4, 6], correct: 8 },
  { sequence: [3, 5, 7], correct: 9 },
  { sequence: [4, 6, 8], correct: 10 },
  { sequence: [1, 3, 5], correct: 7 },
  { sequence: [11, 13, 15], correct: 17 },
  // Increasing by 3
  { sequence: [2, 5, 8], correct: 11 },
  { sequence: [6, 9, 12], correct: 15 },
  { sequence: [9, 12, 15], correct: 18 },
  // Increasing by 4
  { sequence: [4, 8, 12], correct: 16 },
  { sequence: [8, 12, 16], correct: 20 },
  // Increasing by 5
  { sequence: [5, 10, 15], correct: 20 },
  { sequence: [10, 15, 20], correct: 25 },
  { sequence: [20, 25, 30], correct: 35 },
  // Increasing by larger step
  { sequence: [4, 9, 14], correct: 19 },
  { sequence: [7, 14, 21], correct: 28 },
  // Decreasing by 1
  { sequence: [10, 9, 8], correct: 7 },
  { sequence: [15, 14, 13], correct: 12 },
  { sequence: [20, 19, 18], correct: 17 },
  // Decreasing by 2
  { sequence: [10, 8, 6], correct: 4 },
  { sequence: [14, 12, 10], correct: 8 },
  { sequence: [20, 18, 16], correct: 14 },
  // Decreasing by 3
  { sequence: [18, 15, 12], correct: 9 },
  { sequence: [21, 18, 15], correct: 12 },
  // Decreasing by 5
  { sequence: [25, 20, 15], correct: 10 },
  { sequence: [30, 25, 20], correct: 15 },
  { sequence: [50, 45, 40], correct: 35 },
];

// ─── MEDIUM ───────────────────────────────────────────────────────────────────
const mediumPatterns: LogicPattern[] = [
  // Arithmetic with larger steps
  { sequence: [3, 8, 13], correct: 18 },
  { sequence: [5, 11, 17], correct: 23 },
  { sequence: [7, 14, 21], correct: 28 },
  { sequence: [10, 18, 26], correct: 34 },
  { sequence: [4, 13, 22], correct: 31 },
  { sequence: [6, 15, 24], correct: 33 },
  // Descending larger steps
  { sequence: [30, 23, 16], correct: 9 },
  { sequence: [40, 31, 22], correct: 13 },
  { sequence: [50, 42, 34], correct: 26 },
  { sequence: [28, 21, 14], correct: 7 },
  { sequence: [45, 36, 27], correct: 18 },
  // Geometric ×2
  { sequence: [2, 4, 8], correct: 16 },
  { sequence: [3, 6, 12], correct: 24 },
  { sequence: [4, 8, 16], correct: 32 },
  { sequence: [5, 10, 20], correct: 40 },
  { sequence: [1, 2, 4], correct: 8 },
  // Geometric ×3
  { sequence: [2, 6, 18], correct: 54 },
  { sequence: [1, 3, 9], correct: 27 },
  // Fibonacci-like
  { sequence: [1, 1, 2, 3], correct: 5 },
  { sequence: [2, 3, 5, 8], correct: 13 },
  { sequence: [3, 5, 8, 13], correct: 21 },
  { sequence: [1, 2, 3, 5], correct: 8 },
  { sequence: [4, 6, 10, 16], correct: 26 },
  // Increasing differences (+1 each step)
  { sequence: [2, 5, 9], correct: 14 },
  { sequence: [1, 4, 8], correct: 13 },
  { sequence: [4, 9, 15], correct: 22 },
  { sequence: [6, 12, 19], correct: 27 },
  { sequence: [3, 7, 12], correct: 18 },
  // Decreasing then resetting
  { sequence: [100, 90, 80], correct: 70 },
  { sequence: [64, 32, 16], correct: 8 },
  { sequence: [81, 27, 9], correct: 3 },
  // Prime-adjacent
  { sequence: [2, 3, 5], correct: 7 },
  { sequence: [3, 5, 7], correct: 11 },
  { sequence: [5, 7, 11], correct: 13 },
  // Skip patterns
  { sequence: [1, 4, 9], correct: 16 },   // squares
  { sequence: [1, 8, 27], correct: 64 },  // cubes
];

// ─── HARD ─────────────────────────────────────────────────────────────────────
const hardPatterns: LogicPattern[] = [
  // Growing differences (+1 each step)
  { sequence: [4, 7, 11, 16], correct: 22 },
  { sequence: [10, 13, 17, 22], correct: 28 },
  { sequence: [5, 8, 12, 17], correct: 23 },
  { sequence: [2, 5, 9, 14], correct: 20 },
  { sequence: [1, 3, 6, 10], correct: 15 },   // triangular numbers
  { sequence: [3, 6, 10, 15], correct: 21 },
  // Alternating steps (+k, +1 repeating)
  { sequence: [2, 5, 6, 9], correct: 10 },
  { sequence: [3, 7, 8, 12], correct: 13 },
  { sequence: [4, 9, 10, 15], correct: 16 },
  { sequence: [1, 6, 7, 12], correct: 13 },
  // Alternating ×2 then +1
  { sequence: [2, 4, 5, 10], correct: 11 },
  { sequence: [3, 6, 7, 14], correct: 15 },
  { sequence: [4, 8, 9, 18], correct: 19 },
  { sequence: [5, 10, 11, 22], correct: 23 },
  // Alternating ×2 then -1
  { sequence: [3, 6, 5, 10], correct: 9 },
  { sequence: [4, 8, 7, 14], correct: 13 },
  // Squares
  { sequence: [1, 4, 9, 16], correct: 25 },
  { sequence: [4, 9, 16, 25], correct: 36 },
  { sequence: [9, 16, 25, 36], correct: 49 },
  // Quadratic (second differences constant)
  { sequence: [2, 7, 14, 23], correct: 34 },
  { sequence: [3, 10, 19, 30], correct: 43 },
  { sequence: [0, 3, 8, 15], correct: 24 },
  { sequence: [1, 5, 11, 19], correct: 29 },
  // Doubling minus constant
  { sequence: [1, 3, 7, 15], correct: 31 },
  { sequence: [2, 5, 11, 23], correct: 47 },
  { sequence: [5, 9, 17, 33], correct: 65 },
  // Growing odd differences (+2 each time)
  { sequence: [2, 5, 10, 17], correct: 26 },
  { sequence: [3, 6, 11, 18], correct: 27 },
  { sequence: [4, 9, 16, 25], correct: 36 },
  // Alternating +big/+small
  { sequence: [1, 11, 13, 23], correct: 25 },
  { sequence: [2, 12, 14, 24], correct: 26 },
  // Powers of 2
  { sequence: [2, 4, 8, 16], correct: 32 },
  { sequence: [4, 8, 16, 32], correct: 64 },
  { sequence: [1, 2, 4, 8], correct: 16 },
  // Powers of 3
  { sequence: [1, 3, 9, 27], correct: 81 },
  // Primes
  { sequence: [2, 3, 5, 7], correct: 11 },
  { sequence: [3, 5, 7, 11], correct: 13 },
  { sequence: [5, 7, 11, 13], correct: 17 },
  // Decreasing geometric
  { sequence: [64, 32, 16, 8], correct: 4 },
  { sequence: [81, 27, 9, 3], correct: 1 },
  // Interleaved two sequences
  { sequence: [1, 10, 2, 20], correct: 3 },    // 1,2,3... and 10,20,30...
  { sequence: [2, 10, 4, 20], correct: 6 },
  { sequence: [5, 1, 10, 2], correct: 15 },
];

function pickRandomPattern(difficulty: Difficulty): LogicPattern {
  let pool: LogicPattern[];

  switch (difficulty) {
    case 'easy':
      pool = easyPatterns;
      break;
    case 'medium':
      pool = [...easyPatterns, ...easyPatterns, ...mediumPatterns, ...mediumPatterns, ...mediumPatterns];
      break;
    case 'hard':
      pool = [...mediumPatterns, ...hardPatterns, ...hardPatterns, ...hardPatterns];
      break;
    default:
      pool = [...easyPatterns, ...mediumPatterns];
  }

  return pool[Math.floor(Math.random() * pool.length)]!;
}

export function generateLogicMiniPuzzle(difficulty: Difficulty): Puzzle {
  const pattern = pickRandomPattern(difficulty);
  const prompt = `Sequence: ${pattern.sequence.join(', ')}, ?`;

  const distractors = new Set<number>();
  let attempts = 0;
  while (distractors.size < 3 && attempts < 200) {
    attempts++;
    // Scale delta relative to correct answer so distractors are meaningful
    const base = Math.max(2, Math.round(Math.abs(pattern.correct) * 0.12));
    const delta = Math.floor(Math.random() * base) + 1;
    const sign = Math.random() > 0.5 ? 1 : -1;
    const candidate = pattern.correct + sign * delta;
    if (candidate !== pattern.correct && candidate > 0) {
      distractors.add(candidate);
    }
  }

  const optionsArray = [...distractors, pattern.correct].sort(() => Math.random() - 0.5);
  const correctIndex = optionsArray.indexOf(pattern.correct);

  return {
    type: 'logic_mini',
    prompt,
    options: optionsArray.map(String),
    correctIndex,
  };
}
