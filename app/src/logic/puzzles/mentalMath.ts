import type { Puzzle } from './types';
import type { Difficulty } from '../difficulty';

function randomInt(min: number, max: number, rng?: () => number): number {
  return Math.floor((rng ?? Math.random)() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[], rng?: () => number): T {
  return arr[Math.floor((rng ?? Math.random)() * arr.length)];
}

/** Scale distractor delta relative to answer size so options stay meaningful */
function distractorDelta(answer: number, rng?: () => number): number {
  const base = Math.max(3, Math.round(Math.abs(answer) * 0.08));
  const delta = randomInt(1, base, rng);
  return (rng ?? Math.random)() > 0.5 ? delta : -delta;
}

function buildOptions(correctAnswer: number, rng?: () => number): { options: string[]; correctIndex: number } {
  const set = new Set<number>();
  set.add(correctAnswer);
  let attempts = 0;
  while (set.size < 4 && attempts < 200) {
    attempts++;
    const candidate = correctAnswer + distractorDelta(correctAnswer, rng);
    if (candidate !== correctAnswer) set.add(candidate);
  }
  const arr = Array.from(set).sort(() => (rng ?? Math.random)() - 0.5);
  return { options: arr.map(String), correctIndex: arr.indexOf(correctAnswer) };
}

// ─── EASY ────────────────────────────────────────────────────────────────────
function generateEasy(rng?: () => number): Puzzle {
  const op = randomChoice(['+', '-'] as const, rng);
  const a = randomInt(1, 20, rng);
  const b = randomInt(1, 20, rng);
  let prompt: string;
  let correct: number;

  if (op === '+') {
    prompt = `${a} + ${b} = ?`;
    correct = a + b;
  } else {
    // ensure non-negative
    const [big, small] = a >= b ? [a, b] : [b, a];
    prompt = `${big} − ${small} = ?`;
    correct = big - small;
  }

  const { options, correctIndex } = buildOptions(correct, rng);
  return { type: 'mental_math', prompt, options, correctIndex };
}

// ─── MEDIUM ───────────────────────────────────────────────────────────────────
function generateMedium(rng?: () => number): Puzzle {
  const op = randomChoice(['+', '-', '×', '÷'] as const, rng);

  let prompt: string;
  let correct: number;

  if (op === '+') {
    const a = randomInt(10, 40, rng);
    const b = randomInt(10, 40, rng);
    prompt = `${a} + ${b} = ?`;
    correct = a + b;
  } else if (op === '-') {
    const a = randomInt(20, 80, rng);
    const b = randomInt(1, a, rng);
    prompt = `${a} − ${b} = ?`;
    correct = a - b;
  } else if (op === '×') {
    const a = randomInt(2, 12, rng);
    const b = randomInt(2, 12, rng);
    prompt = `${a} × ${b} = ?`;
    correct = a * b;
  } else {
    // clean division: pick quotient and divisor
    const divisor = randomInt(2, 9, rng);
    const quotient = randomInt(2, 12, rng);
    const dividend = divisor * quotient;
    prompt = `${dividend} ÷ ${divisor} = ?`;
    correct = quotient;
  }

  const { options, correctIndex } = buildOptions(correct, rng);
  return { type: 'mental_math', prompt, options, correctIndex };
}

// ─── HARD ─────────────────────────────────────────────────────────────────────
function generateHard(rng?: () => number): Puzzle {
  const variant = randomChoice(['add', 'sub', 'mul', 'div', 'two_step', 'square'] as const, rng);

  let prompt: string;
  let correct: number;

  if (variant === 'add') {
    const a = randomInt(20, 80, rng);
    const b = randomInt(20, 80, rng);
    prompt = `${a} + ${b} = ?`;
    correct = a + b;
  } else if (variant === 'sub') {
    const a = randomInt(40, 150, rng);
    const b = randomInt(10, a - 1, rng);
    prompt = `${a} − ${b} = ?`;
    correct = a - b;
  } else if (variant === 'mul') {
    const a = randomInt(3, 15, rng);
    const b = randomInt(3, 15, rng);
    prompt = `${a} × ${b} = ?`;
    correct = a * b;
  } else if (variant === 'div') {
    const divisor = randomInt(3, 12, rng);
    const quotient = randomInt(5, 15, rng);
    const dividend = divisor * quotient;
    prompt = `${dividend} ÷ ${divisor} = ?`;
    correct = quotient;
  } else if (variant === 'two_step') {
    const a = randomInt(2, 10, rng);
    const b = randomInt(2, 10, rng);
    const c = randomInt(2, 8, rng);
    prompt = `(${a} + ${b}) × ${c} = ?`;
    correct = (a + b) * c;
  } else {
    // square + offset
    const base = randomInt(4, 12, rng);
    const offset = randomInt(1, 15, rng);
    const addOrSub = (rng ?? Math.random)() > 0.5;
    prompt = addOrSub ? `${base}² + ${offset} = ?` : `${base}² − ${offset} = ?`;
    correct = addOrSub ? base * base + offset : base * base - offset;
  }

  const { options, correctIndex } = buildOptions(correct, rng);
  return { type: 'mental_math', prompt, options, correctIndex };
}

export function generateMentalMathPuzzle(difficulty: Difficulty, rng?: () => number): Puzzle {
  switch (difficulty) {
    case 'easy':
      return generateEasy(rng);
    case 'medium':
      return generateMedium(rng);
    case 'hard':
      return generateHard(rng);
    default:
      return generateMedium(rng);
  }
}
