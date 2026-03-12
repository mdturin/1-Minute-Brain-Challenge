import type { Puzzle } from './types';
import type { Difficulty } from '../difficulty';

type LogicPattern = {
  sequence: number[];
  correct: number;
};

const easyPatterns: LogicPattern[] = [
  { sequence: [2, 4, 6], correct: 8 },
  { sequence: [3, 6, 9], correct: 12 },
  { sequence: [5, 10, 15], correct: 20 },
];

const mediumPatterns: LogicPattern[] = [
  { sequence: [1, 1, 2, 3], correct: 5 },
  { sequence: [2, 3, 5, 8], correct: 13 },
];

const hardPatterns: LogicPattern[] = [
  { sequence: [4, 7, 11, 16], correct: 22 },
  { sequence: [2, 4, 8, 16], correct: 32 },
];

function pickRandomPattern(difficulty: Difficulty): LogicPattern {
  let pool: LogicPattern[];

  switch (difficulty) {
    case 'easy':
      pool = easyPatterns;
      break;
    case 'medium':
      pool = [...easyPatterns, ...mediumPatterns];
      break;
    case 'hard':
      pool = [...mediumPatterns, ...hardPatterns];
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

