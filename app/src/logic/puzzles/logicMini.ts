import type { Puzzle } from './types';
import type { Difficulty } from '../difficulty';

type LogicPattern = {
  sequence: number[];
  correct: number;
};

// Easy: short arithmetic progressions with small positive steps
const easyPatterns: LogicPattern[] = [
  { sequence: [1, 2, 3], correct: 4 },
  { sequence: [2, 4, 6], correct: 8 },
  { sequence: [3, 5, 7], correct: 9 },
  { sequence: [5, 10, 15], correct: 20 },
  { sequence: [4, 6, 8], correct: 10 },
  { sequence: [7, 9, 11], correct: 13 },
  { sequence: [10, 15, 20], correct: 25 },
  { sequence: [1, 3, 5], correct: 7 },
  { sequence: [6, 9, 12], correct: 15 },
  { sequence: [8, 12, 16], correct: 20 },
  { sequence: [9, 12, 15], correct: 18 },
  { sequence: [2, 5, 8], correct: 11 },
  { sequence: [4, 9, 14], correct: 19 },
  { sequence: [11, 13, 15], correct: 17 },
  { sequence: [20, 25, 30], correct: 35 },
];

// Medium: larger steps, simple geometric, and Fibonacci-like patterns
const mediumPatterns: LogicPattern[] = [
  // arithmetic with larger steps
  { sequence: [3, 8, 13], correct: 18 },
  { sequence: [5, 11, 17], correct: 23 },
  { sequence: [7, 14, 21], correct: 28 },
  { sequence: [10, 18, 26], correct: 34 },
  // geometric
  { sequence: [2, 4, 8], correct: 16 },
  { sequence: [3, 6, 12], correct: 24 },
  { sequence: [4, 8, 16], correct: 32 },
  { sequence: [5, 10, 20], correct: 40 },
  // Fibonacci-like
  { sequence: [1, 1, 2, 3], correct: 5 },
  { sequence: [2, 3, 5, 8], correct: 13 },
  { sequence: [3, 5, 8, 13], correct: 21 },
  { sequence: [1, 2, 3, 5], correct: 8 },
  // increasing differences
  { sequence: [2, 5, 9], correct: 14 }, // +3, +4, +5
  { sequence: [1, 4, 8], correct: 13 }, // +3, +4, +5
  { sequence: [4, 9, 15], correct: 22 }, // +5, +6, +7
  { sequence: [6, 12, 19], correct: 27 }, // +6, +7, +8
];

// Hard: alternating, mixed and second-order patterns
const hardPatterns: LogicPattern[] = [
  // alternating differences
  { sequence: [4, 7, 11, 16], correct: 22 }, // +3, +4, +5, +6
  { sequence: [10, 13, 17, 22], correct: 28 }, // +3, +4, +5, +6
  { sequence: [5, 8, 12, 17], correct: 23 }, // +3, +4, +5, +6
  // alternating steps
  { sequence: [2, 5, 6, 9], correct: 10 }, // +3, +1, +3, +1
  { sequence: [3, 7, 8, 12], correct: 13 }, // +4, +1, +4, +1
  { sequence: [4, 9, 10, 15], correct: 16 }, // +5, +1, +5, +1
  // alternating multiply/add
  { sequence: [2, 4, 5, 10], correct: 11 }, // ×2, +1, ×2, +1
  { sequence: [3, 6, 7, 14], correct: 15 }, // ×2, +1, ×2, +1
  { sequence: [4, 8, 9, 18], correct: 19 }, // ×2, +1, ×2, +1
  // quadratic-like (second-order differences constant)
  { sequence: [1, 4, 9, 16], correct: 25 },
  { sequence: [2, 7, 14, 23], correct: 34 },
  { sequence: [3, 10, 19, 30], correct: 43 },
  // more complex growth
  { sequence: [2, 4, 8, 16], correct: 32 },
  { sequence: [1, 3, 7, 15], correct: 31 },
  { sequence: [5, 9, 17, 33], correct: 65 },
  // combined patterns
  { sequence: [2, 5, 10, 17], correct: 26 }, // +3, +5, +7, +9
  { sequence: [3, 6, 11, 18], correct: 27 }, // +3, +5, +7, +9
  { sequence: [4, 9, 16, 25], correct: 36 }, // +5, +7, +9, +11
];

function pickRandomPattern(difficulty: Difficulty): LogicPattern {
  let pool: LogicPattern[];

  switch (difficulty) {
    case 'easy':
      pool = easyPatterns;
      break;
    case 'medium':
      // mostly medium patterns with some easier ones mixed in
      pool = [...easyPatterns, ...easyPatterns, ...mediumPatterns, ...mediumPatterns, ...mediumPatterns];
      break;
    case 'hard':
      // strongly biased towards hard patterns, with some medium as a ramp
      pool = [...mediumPatterns, ...hardPatterns, ...hardPatterns, ...hardPatterns];
      break;
    default:
      pool = [...easyPatterns, ...mediumPatterns];
  }

  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

export function generateLogicMiniPuzzle(difficulty: Difficulty): Puzzle {
  const pattern = pickRandomPattern(difficulty);
  const prompt = `Sequence: ${pattern.sequence.join(', ')}, ?`;

  const distractors = new Set<number>();
  while (distractors.size < 3) {
    const delta = Math.floor(Math.random() * 5) + 1;
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

