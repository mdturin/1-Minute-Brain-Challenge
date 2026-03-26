import type { Puzzle } from './types';
import type { Difficulty } from '../difficulty';

function randomInt(min: number, max: number, rng?: () => number): number {
  return Math.floor((rng ?? Math.random)() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[], rng?: () => number): T[] {
  return [...arr].sort(() => (rng ?? Math.random)() - 0.5);
}

type PatternTemplate = {
  label: string;
  generate: (rng?: () => number) => { sequence: number[]; correct: number; trap: number };
};

const EASY_PATTERNS: PatternTemplate[] = [
  {
    // +step, but doubles halfway through
    label: 'add-then-double',
    generate: (rng) => {
      const start = randomInt(1, 5, rng);
      const step = randomInt(2, 4, rng);
      const seq = [start, start + step, start + 2 * step, start + 4 * step]; // doubles at end
      const correct = start + 8 * step; // doubles again
      const trap = start + 3 * step;   // would be next if it were purely +step
      return { sequence: seq, correct, trap };
    },
  },
  {
    // Fibonacci-like: each = sum of previous two
    label: 'fibonacci-like',
    generate: (rng) => {
      const a = randomInt(1, 3, rng);
      const b = randomInt(2, 5, rng);
      const c = a + b;
      const d = b + c;
      const correct = c + d;
      const trap = d + 1;  // off by 1
      return { sequence: [a, b, c, d], correct, trap };
    },
  },
];

const MEDIUM_PATTERNS: PatternTemplate[] = [
  {
    // Powers of 2 but one extra
    label: 'powers-of-2',
    generate: (rng) => {
      const start = randomInt(1, 3, rng);
      const seq = [start, start * 2, start * 4, start * 8];
      const correct = start * 16;
      const trap = start * 12; // 8+4 (looks like adding previous)
      return { sequence: seq, correct, trap };
    },
  },
  {
    // +1, +2, +4, +8 (doubling differences)
    label: 'doubling-diff',
    generate: (rng) => {
      const start = randomInt(2, 8, rng);
      const seq = [start, start + 1, start + 3, start + 7, start + 15];
      const correct = start + 31; // +16
      const trap = start + 23;   // +8 more (wrong)
      return { sequence: seq, correct, trap };
    },
  },
];

const HARD_PATTERNS: PatternTemplate[] = [
  {
    // Alternating: +3, ×2, +3, ×2...
    label: 'alternating-ops',
    generate: (rng) => {
      const start = randomInt(1, 4, rng);
      const add = randomInt(2, 5, rng);
      const a = start + add;
      const b = a * 2;
      const c = b + add;
      const d = c * 2;
      const correct = d + add; // next: +add
      const trap = d * 2;      // looks like ×2 (wrong turn)
      return { sequence: [start, a, b, c, d], correct, trap };
    },
  },
  {
    // n² sequence
    label: 'squares',
    generate: (rng) => {
      const offset = randomInt(0, 3, rng);
      const seq = [1, 4, 9, 16].map((n) => n + offset);
      const correct = 25 + offset;
      const trap = 24 + offset; // off by 1
      return { sequence: seq, correct, trap };
    },
  },
];

export function generateFakePatternPuzzle(difficulty: Difficulty, rng?: () => number): Puzzle {
  const templates =
    difficulty === 'easy' ? EASY_PATTERNS : difficulty === 'medium' ? MEDIUM_PATTERNS : HARD_PATTERNS;

  const template = templates[randomInt(0, templates.length - 1, rng)]!;
  const { sequence, correct, trap } = template.generate(rng);

  // Build 4 options: correct + trap + 2 other distractors
  const d1 = correct + randomInt(2, 6, rng);
  const d2 = correct - randomInt(2, 6, rng);

  const rawOptions = [correct, trap, d1 > 0 ? d1 : d2 + 1, d2 > 0 ? d2 : correct + 1];
  // Deduplicate
  const unique = Array.from(new Set(rawOptions)).slice(0, 4);
  while (unique.length < 4) unique.push(unique[unique.length - 1]! + 1);

  const shuffled = shuffle(unique, rng);
  const correctIndex = shuffled.indexOf(correct);

  const seqDisplay = sequence.join(', ') + ', ?';

  return {
    type: 'fake_pattern',
    prompt: seqDisplay,
    options: shuffled.map(String),
    correctIndex,
  };
}
