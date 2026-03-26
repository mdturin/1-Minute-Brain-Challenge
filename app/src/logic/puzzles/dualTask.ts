import type { Puzzle } from './types';
import type { Difficulty } from '../difficulty';

const COLORS = ['Red', 'Blue', 'Green', 'Yellow', 'Purple'];

export const COLOR_HEX: Record<string, string> = {
  Red: '#ef4444',
  Blue: '#3b82f6',
  Green: '#22c55e',
  Yellow: '#eab308',
  Purple: '#a855f7',
};

function randomInt(min: number, max: number, rng?: () => number): number {
  return Math.floor((rng ?? Math.random)() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[], rng?: () => number): T {
  return arr[Math.floor((rng ?? Math.random)() * arr.length)]!;
}

export function generateDualTaskPuzzle(difficulty: Difficulty, rng?: () => number): Puzzle {
  let a: number, b: number, mathAnswer: number, mathPrompt: string, colorCount: number;

  switch (difficulty) {
    case 'easy':
      a = randomInt(1, 9, rng);
      b = randomInt(1, 9, rng);
      mathAnswer = a + b;
      mathPrompt = `${a} + ${b} = ?`;
      colorCount = 2;
      break;
    case 'medium':
      a = randomInt(10, 25, rng);
      b = randomInt(5, 15, rng);
      mathAnswer = a + b;
      mathPrompt = `${a} + ${b} = ?`;
      colorCount = 3;
      break;
    case 'hard':
    default:
      a = randomInt(2, 9, rng);
      b = randomInt(2, 9, rng);
      mathAnswer = a * b;
      mathPrompt = `${a} × ${b} = ?`;
      colorCount = 4;
      break;
  }

  // Shuffle and pick a color sequence
  const shuffled = [...COLORS].sort(() => (rng ?? Math.random)() - 0.5);
  const sequence = shuffled.slice(0, colorCount);
  const lastColor = sequence[sequence.length - 1]!;

  // Wrong math answer (different from correct, positive)
  let wrongMath: number;
  let attempts = 0;
  do {
    const delta = randomInt(1, 4, rng) * ((rng ?? Math.random)() > 0.5 ? 1 : -1);
    wrongMath = mathAnswer + delta;
    attempts++;
  } while ((wrongMath === mathAnswer || wrongMath <= 0) && attempts < 20);
  if (wrongMath === mathAnswer) wrongMath = mathAnswer + 1;

  // Wrong colors (different from lastColor)
  const otherColors = COLORS.filter((c) => c !== lastColor);
  const wrongColor1 = randomChoice(otherColors, rng);
  const wrongColor2 = randomChoice(
    otherColors.filter((c) => c !== wrongColor1),
    rng,
  );

  // Build 4 options: correct first, then distractors
  const rawOptions = [
    `${mathAnswer} · ${lastColor}`,  // correct
    `${wrongMath} · ${lastColor}`,   // wrong math, right color
    `${mathAnswer} · ${wrongColor1}`, // right math, wrong color
    `${wrongMath} · ${wrongColor2}`,  // both wrong
  ];

  // Shuffle while tracking correct index
  const indexed = rawOptions.map((o, i) => ({ o, i }));
  indexed.sort(() => (rng ?? Math.random)() - 0.5);

  return {
    type: 'dual_task',
    prompt: mathPrompt,
    options: indexed.map((x) => x.o),
    correctIndex: indexed.findIndex((x) => x.i === 0),
    meta: {
      colors: sequence,
      colorHex: COLOR_HEX,
    },
  };
}
