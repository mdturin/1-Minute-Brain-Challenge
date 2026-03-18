import type { Puzzle } from './types';
import type { Difficulty } from '../difficulty';

function randomInt(min: number, max: number, rng?: () => number): number {
  return Math.floor((rng ?? Math.random)() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[], rng?: () => number): T {
  return arr[Math.floor((rng ?? Math.random)() * arr.length)];
}

const COLORS = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'White'];
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T'];

// ─── NUMBER SEQUENCE ─────────────────────────────────────────────────────────
function generateNumberSequence(difficulty: Difficulty, rng?: () => number): Puzzle {
  let minLength: number;
  let maxLength: number;

  switch (difficulty) {
    case 'easy':   minLength = 3; maxLength = 4; break;
    case 'medium': minLength = 4; maxLength = 6; break;
    case 'hard':   minLength = 6; maxLength = 8; break;
    default:       minLength = 3; maxLength = 5;
  }

  const length = randomInt(minLength, maxLength, rng);
  const sequence: number[] = Array.from({ length }, () => randomInt(1, 9, rng));
  const targetIndex = randomInt(0, length - 1, rng);
  const correctValue = sequence[targetIndex]!;

  const prompt = `Sequence: ${sequence.join('  ')}\n\nWhich number was in position ${targetIndex + 1}?`;

  // Smarter distractors: prefer adjacent values so options aren't trivial
  const options = new Set<number>();
  options.add(correctValue);
  while (options.size < 4) {
    // 60% chance of picking a nearby value, 40% random
    const useNearby = (rng ?? Math.random)() < 0.6;
    const candidate = useNearby
      ? Math.max(1, Math.min(9, correctValue + randomInt(-2, 2, rng)))
      : randomInt(1, 9, rng);
    if (candidate !== correctValue || options.size < 2) options.add(candidate);
  }

  const arr = Array.from(options).sort(() => (rng ?? Math.random)() - 0.5);
  return {
    type: 'memory_sequence',
    prompt,
    options: arr.map(String),
    correctIndex: arr.indexOf(correctValue),
    meta: { sequence, targetIndex },
  };
}

// ─── SUM OF TWO POSITIONS (Hard only) ────────────────────────────────────────
function generateSumSequence(rng?: () => number): Puzzle {
  const length = randomInt(5, 8, rng);
  const sequence: number[] = Array.from({ length }, () => randomInt(1, 9, rng));
  const idx1 = randomInt(0, length - 2, rng);
  const idx2 = randomInt(idx1 + 1, length - 1, rng);
  const correctValue = sequence[idx1]! + sequence[idx2]!;

  const prompt = `Sequence: ${sequence.join('  ')}\n\nWhat is the SUM of positions ${idx1 + 1} and ${idx2 + 1}?`;

  const options = new Set<number>();
  options.add(correctValue);
  while (options.size < 4) {
    const delta = randomInt(1, 4, rng) * ((rng ?? Math.random)() > 0.5 ? 1 : -1);
    const candidate = correctValue + delta;
    if (candidate > 0) options.add(candidate);
  }

  const arr = Array.from(options).sort(() => (rng ?? Math.random)() - 0.5);
  return {
    type: 'memory_sequence',
    prompt,
    options: arr.map(String),
    correctIndex: arr.indexOf(correctValue),
    meta: { sequence, targetIndex: idx1 },
  };
}

// ─── COLOR SEQUENCE ───────────────────────────────────────────────────────────
function generateColorSequence(difficulty: Difficulty, rng?: () => number): Puzzle {
  const length = difficulty === 'easy' ? randomInt(3, 4, rng) : difficulty === 'medium' ? randomInt(4, 6, rng) : randomInt(5, 7, rng);
  const sequence: string[] = Array.from({ length }, () => randomChoice(COLORS, rng));
  const targetIndex = randomInt(0, length - 1, rng);
  const correctColor = sequence[targetIndex]!;

  const prompt = `Colors: ${sequence.join(', ')}\n\nWhat color was in position ${targetIndex + 1}?`;

  const wrongPool = COLORS.filter((c) => c !== correctColor);
  const distractors = wrongPool.sort(() => (rng ?? Math.random)() - 0.5).slice(0, 3);
  const arr = [...distractors, correctColor].sort(() => (rng ?? Math.random)() - 0.5);

  return {
    type: 'memory_sequence',
    prompt,
    options: arr,
    correctIndex: arr.indexOf(correctColor),
    meta: { sequence: sequence.map((_, i) => i), targetIndex },
  };
}

// ─── LETTER SEQUENCE ──────────────────────────────────────────────────────────
function generateLetterSequence(difficulty: Difficulty, rng?: () => number): Puzzle {
  const length = difficulty === 'medium' ? randomInt(4, 6, rng) : randomInt(6, 8, rng);
  const sequence: string[] = Array.from({ length }, () => randomChoice(LETTERS, rng));
  const targetIndex = randomInt(0, length - 1, rng);
  const correctLetter = sequence[targetIndex]!;

  const prompt = `Letters: ${sequence.join('  ')}\n\nWhich letter was in position ${targetIndex + 1}?`;

  const wrongPool = LETTERS.filter((l) => l !== correctLetter);
  const distractors = wrongPool.sort(() => (rng ?? Math.random)() - 0.5).slice(0, 3);
  const arr = [...distractors, correctLetter].sort(() => (rng ?? Math.random)() - 0.5);

  return {
    type: 'memory_sequence',
    prompt,
    options: arr,
    correctIndex: arr.indexOf(correctLetter),
    meta: { sequence: sequence.map((_, i) => i), targetIndex },
  };
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export function generateMemorySequencePuzzle(difficulty: Difficulty, rng?: () => number): Puzzle {
  if (difficulty === 'easy') {
    // Easy: numbers only
    return generateNumberSequence('easy', rng);
  }

  if (difficulty === 'medium') {
    // Medium: numbers or colors
    const subtype = randomChoice(['numbers', 'colors'] as const, rng);
    return subtype === 'colors'
      ? generateColorSequence('medium', rng)
      : generateNumberSequence('medium', rng);
  }

  // Hard: numbers, colors, letters, or sum
  const subtype = randomChoice(['numbers', 'colors', 'letters', 'sum'] as const, rng);
  switch (subtype) {
    case 'colors':  return generateColorSequence('hard', rng);
    case 'letters': return generateLetterSequence('hard', rng);
    case 'sum':     return generateSumSequence(rng);
    default:        return generateNumberSequence('hard', rng);
  }
}
