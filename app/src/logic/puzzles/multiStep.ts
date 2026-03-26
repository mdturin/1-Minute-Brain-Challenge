import type { Puzzle } from './types';
import type { Difficulty } from '../difficulty';

function randomInt(min: number, max: number, rng?: () => number): number {
  return Math.floor((rng ?? Math.random)() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[], rng?: () => number): T[] {
  return [...arr].sort(() => (rng ?? Math.random)() - 0.5);
}

function wrongNear(n: number, rng?: () => number): number {
  const delta = randomInt(1, 5, rng) * ((rng ?? Math.random)() > 0.5 ? 1 : -1);
  const r = n + delta;
  return r <= 0 ? n + randomInt(1, 5, rng) : r;
}

export function generateMultiStepPuzzle(difficulty: Difficulty, rng?: () => number): Puzzle {
  let step1: { expr: string; result: number };
  let step2expr: string;
  let finalAnswer: number;

  switch (difficulty) {
    case 'easy': {
      // Step 1: a + b, Step 2: result - c
      const a = randomInt(2, 8, rng);
      const b = randomInt(2, 8, rng);
      const c = randomInt(1, 5, rng);
      const r1 = a + b;
      finalAnswer = r1 - c;
      step1 = { expr: `${a} + ${b}`, result: r1 };
      step2expr = `■ − ${c}`;
      break;
    }
    case 'medium': {
      // Step 1: a × b, Step 2: result + c
      const a = randomInt(2, 7, rng);
      const b = randomInt(2, 6, rng);
      const c = randomInt(3, 15, rng);
      const r1 = a * b;
      finalAnswer = r1 + c;
      step1 = { expr: `${a} × ${b}`, result: r1 };
      step2expr = `■ + ${c}`;
      break;
    }
    case 'hard':
    default: {
      // Step 1: a × b, Step 2: result × c
      const a = randomInt(2, 6, rng);
      const b = randomInt(2, 5, rng);
      const c = randomInt(2, 4, rng);
      const r1 = a * b;
      finalAnswer = r1 * c;
      step1 = { expr: `${a} × ${b}`, result: r1 };
      step2expr = `■ × ${c}`;
      break;
    }
  }

  const distractors = new Set<number>();
  let att = 0;
  while (distractors.size < 3 && att < 100) {
    const w = wrongNear(finalAnswer, rng);
    if (w !== finalAnswer) distractors.add(w);
    att++;
  }

  const shuffled = shuffle([finalAnswer, ...Array.from(distractors)], rng);
  const correctIndex = shuffled.indexOf(finalAnswer);

  return {
    type: 'multi_step',
    prompt: `Step 1: ${step1.expr} = ■\nStep 2: ${step2expr} = ?`,
    options: shuffled.map(String),
    correctIndex,
    meta: { step1Result: step1.result },
  };
}
