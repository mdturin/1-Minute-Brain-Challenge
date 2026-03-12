import type { Puzzle } from './types';
import type { Difficulty } from '../difficulty';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateMentalMathPuzzle(difficulty: Difficulty): Puzzle {
  let maxValue: number;
  let allowMultiplication: boolean;

  switch (difficulty) {
    case 'easy':
      maxValue = 20;
      allowMultiplication = false;
      break;
    case 'medium':
      maxValue = 40;
      allowMultiplication = true;
      break;
    case 'hard':
      maxValue = 80;
      allowMultiplication = true;
      break;
    default:
      maxValue = 30;
      allowMultiplication = true;
  }

  const a = randomInt(1, maxValue);
  const b = randomInt(1, maxValue);
  const opIndex = allowMultiplication ? randomInt(0, 2) : randomInt(0, 1);
  const ops = ['+', '-', '×'] as const;
  const op = ops[opIndex];

  let correctAnswer = 0;
  switch (op) {
    case '+':
      correctAnswer = a + b;
      break;
    case '-':
      correctAnswer = a - b;
      break;
    case '×':
      correctAnswer = a * b;
      break;
  }

  const prompt = `${a} ${op} ${b} = ?`;

  const options = new Set<number>();
  options.add(correctAnswer);
  while (options.size < 4) {
    const delta = randomInt(-5, 5);
    if (delta === 0) continue;
    options.add(correctAnswer + delta);
  }

  const optionsArray = Array.from(options).sort(() => Math.random() - 0.5);
  const correctIndex = optionsArray.indexOf(correctAnswer);

  return {
    type: 'mental_math',
    prompt,
    options: optionsArray.map(String),
    correctIndex,
  };
}

