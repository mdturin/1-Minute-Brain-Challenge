import type { Puzzle } from './types';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateMentalMathPuzzle(): Puzzle {
  const a = randomInt(1, 20);
  const b = randomInt(1, 20);
  const opIndex = randomInt(0, 2);
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

