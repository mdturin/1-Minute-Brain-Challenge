import type { Puzzle } from './types';
import type { Difficulty } from '../difficulty';

function randomInt(min: number, max: number, rng?: () => number): number {
  return Math.floor((rng ?? Math.random)() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[], rng?: () => number): T[] {
  return [...arr].sort(() => (rng ?? Math.random)() - 0.5);
}

function wrongNear(n: number, rng?: () => number): number {
  const delta = randomInt(1, 6, rng) * ((rng ?? Math.random)() > 0.5 ? 1 : -1);
  const result = n + delta;
  return result <= 0 ? n + randomInt(1, 6, rng) : result;
}

export function generateReverseLogicPuzzle(difficulty: Difficulty, rng?: () => number): Puzzle {
  const numRange = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 30 : 50;

  // Generate 4 equations — 3 correct, 1 wrong
  // The "wrong" one has an incorrect result
  const equations: { text: string; isWrong: boolean }[] = [];

  for (let i = 0; i < 4; i++) {
    const a = randomInt(1, numRange, rng);
    const b = randomInt(1, numRange, rng);

    if (i === 0) {
      // This is the WRONG equation — use an incorrect result
      const wrongResult = wrongNear(a + b, rng);
      equations.push({ text: `${a} + ${b} = ${wrongResult}`, isWrong: true });
    } else {
      // These are correct equations
      equations.push({ text: `${a} + ${b} = ${a + b}`, isWrong: false });
    }
  }

  // For medium/hard, mix in subtraction and multiplication as wrong type
  if (difficulty !== 'easy') {
    const wrongIdx = randomInt(0, 3, rng);
    for (let i = 0; i < 4; i++) {
      const isWrong = i === wrongIdx;
      const a = randomInt(1, numRange, rng);
      const b = randomInt(1, numRange, rng);
      const opRoll = (rng ?? Math.random)();
      if (opRoll < 0.5) {
        // addition
        const result = isWrong ? wrongNear(a + b, rng) : a + b;
        equations[i] = { text: `${a} + ${b} = ${result}`, isWrong };
      } else {
        // subtraction (ensure a >= b)
        const big = Math.max(a, b), small = Math.min(a, b);
        const result = isWrong ? wrongNear(big - small, rng) : big - small;
        equations[i] = { text: `${big} − ${small} = ${result}`, isWrong };
      }
    }
    // For hard: one multiplication
    if (difficulty === 'hard') {
      const idx = randomInt(0, 3, rng);
      const a = randomInt(2, 9, rng);
      const b = randomInt(2, 9, rng);
      const isW = idx === wrongIdx;
      const result = isW ? wrongNear(a * b, rng) : a * b;
      equations[idx] = { text: `${a} × ${b} = ${result}`, isWrong: isW };
    }
  }

  const shuffled = shuffle(equations, rng);
  const correctIndex = shuffled.findIndex((e) => e.isWrong);

  return {
    type: 'reverse_logic',
    prompt: 'Which answer is WRONG?',
    options: shuffled.map((e) => e.text),
    correctIndex,
  };
}
