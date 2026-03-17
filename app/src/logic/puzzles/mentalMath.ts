import type { Puzzle } from './types';
import type { Difficulty } from '../difficulty';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Scale distractor delta relative to answer size so options stay meaningful */
function distractorDelta(answer: number): number {
  const base = Math.max(3, Math.round(Math.abs(answer) * 0.08));
  const delta = randomInt(1, base);
  return Math.random() > 0.5 ? delta : -delta;
}

function buildOptions(correctAnswer: number): { options: string[]; correctIndex: number } {
  const set = new Set<number>();
  set.add(correctAnswer);
  let attempts = 0;
  while (set.size < 4 && attempts < 200) {
    attempts++;
    const candidate = correctAnswer + distractorDelta(correctAnswer);
    if (candidate !== correctAnswer) set.add(candidate);
  }
  const arr = Array.from(set).sort(() => Math.random() - 0.5);
  return { options: arr.map(String), correctIndex: arr.indexOf(correctAnswer) };
}

// ─── EASY ────────────────────────────────────────────────────────────────────
function generateEasy(): Puzzle {
  const op = randomChoice(['+', '-'] as const);
  const a = randomInt(1, 20);
  const b = randomInt(1, 20);
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

  const { options, correctIndex } = buildOptions(correct);
  return { type: 'mental_math', prompt, options, correctIndex };
}

// ─── MEDIUM ───────────────────────────────────────────────────────────────────
function generateMedium(): Puzzle {
  const op = randomChoice(['+', '-', '×', '÷'] as const);

  let prompt: string;
  let correct: number;

  if (op === '+') {
    const a = randomInt(10, 40);
    const b = randomInt(10, 40);
    prompt = `${a} + ${b} = ?`;
    correct = a + b;
  } else if (op === '-') {
    const a = randomInt(20, 80);
    const b = randomInt(1, a);
    prompt = `${a} − ${b} = ?`;
    correct = a - b;
  } else if (op === '×') {
    const a = randomInt(2, 12);
    const b = randomInt(2, 12);
    prompt = `${a} × ${b} = ?`;
    correct = a * b;
  } else {
    // clean division: pick quotient and divisor
    const divisor = randomInt(2, 9);
    const quotient = randomInt(2, 12);
    const dividend = divisor * quotient;
    prompt = `${dividend} ÷ ${divisor} = ?`;
    correct = quotient;
  }

  const { options, correctIndex } = buildOptions(correct);
  return { type: 'mental_math', prompt, options, correctIndex };
}

// ─── HARD ─────────────────────────────────────────────────────────────────────
function generateHard(): Puzzle {
  const variant = randomChoice(['add', 'sub', 'mul', 'div', 'two_step', 'square'] as const);

  let prompt: string;
  let correct: number;

  if (variant === 'add') {
    const a = randomInt(20, 80);
    const b = randomInt(20, 80);
    prompt = `${a} + ${b} = ?`;
    correct = a + b;
  } else if (variant === 'sub') {
    const a = randomInt(40, 150);
    const b = randomInt(10, a - 1);
    prompt = `${a} − ${b} = ?`;
    correct = a - b;
  } else if (variant === 'mul') {
    const a = randomInt(3, 15);
    const b = randomInt(3, 15);
    prompt = `${a} × ${b} = ?`;
    correct = a * b;
  } else if (variant === 'div') {
    const divisor = randomInt(3, 12);
    const quotient = randomInt(5, 15);
    const dividend = divisor * quotient;
    prompt = `${dividend} ÷ ${divisor} = ?`;
    correct = quotient;
  } else if (variant === 'two_step') {
    const a = randomInt(2, 10);
    const b = randomInt(2, 10);
    const c = randomInt(2, 8);
    prompt = `(${a} + ${b}) × ${c} = ?`;
    correct = (a + b) * c;
  } else {
    // square + offset
    const base = randomInt(4, 12);
    const offset = randomInt(1, 15);
    const addOrSub = Math.random() > 0.5;
    prompt = addOrSub ? `${base}² + ${offset} = ?` : `${base}² − ${offset} = ?`;
    correct = addOrSub ? base * base + offset : base * base - offset;
  }

  const { options, correctIndex } = buildOptions(correct);
  return { type: 'mental_math', prompt, options, correctIndex };
}

export function generateMentalMathPuzzle(difficulty: Difficulty): Puzzle {
  switch (difficulty) {
    case 'easy':
      return generateEasy();
    case 'medium':
      return generateMedium();
    case 'hard':
      return generateHard();
    default:
      return generateMedium();
  }
}
