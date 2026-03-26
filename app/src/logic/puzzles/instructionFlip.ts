import type { Puzzle } from './types';
import type { Difficulty } from '../difficulty';

type Rule = 'largest' | 'smallest' | 'even' | 'odd' | 'closest_to_10' | 'prime';

export const RULE_PROMPTS: Record<Rule, string> = {
  largest: 'Tap the LARGEST number',
  smallest: 'Tap the SMALLEST number',
  even: 'Tap the EVEN number',
  odd: 'Tap the ODD number',
  closest_to_10: 'Tap the number CLOSEST TO 10',
  prime: 'Tap the PRIME number',
};

const EASY_RULES: Rule[] = ['largest', 'smallest'];
const MEDIUM_RULES: Rule[] = ['largest', 'smallest', 'even', 'odd'];
const HARD_RULES: Rule[] = ['largest', 'smallest', 'even', 'odd', 'closest_to_10', 'prime'];

function randomInt(min: number, max: number, rng?: () => number): number {
  return Math.floor((rng ?? Math.random)() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[], rng?: () => number): T {
  return arr[Math.floor((rng ?? Math.random)() * arr.length)]!;
}

function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}

function uniqueInts(count: number, min: number, max: number, rng?: () => number): number[] {
  const set = new Set<number>();
  let attempts = 0;
  while (set.size < count && attempts < 500) {
    set.add(randomInt(min, max, rng));
    attempts++;
  }
  return Array.from(set);
}

function shuffledWithCorrect(
  correct: number,
  others: number[],
  rng?: () => number,
): { options: string[]; correctIndex: number } {
  const all = [correct, ...others].sort(() => (rng ?? Math.random)() - 0.5);
  return {
    options: all.map(String),
    correctIndex: all.indexOf(correct),
  };
}

export function generateInstructionFlipPuzzle(difficulty: Difficulty, rng?: () => number): Puzzle {
  let rules: Rule[];
  let min: number, max: number;

  switch (difficulty) {
    case 'easy':
      rules = EASY_RULES; min = 1; max = 20;
      break;
    case 'medium':
      rules = MEDIUM_RULES; min = 1; max = 50;
      break;
    case 'hard':
    default:
      rules = HARD_RULES; min = 1; max = 99;
      break;
  }

  const rule = randomChoice(rules, rng);

  let correct: number;
  let others: number[];

  switch (rule) {
    case 'largest': {
      const nums = uniqueInts(4, min, max, rng);
      correct = Math.max(...nums);
      others = nums.filter((n) => n !== correct);
      break;
    }
    case 'smallest': {
      const nums = uniqueInts(4, min, max, rng);
      correct = Math.min(...nums);
      others = nums.filter((n) => n !== correct);
      break;
    }
    case 'even': {
      // 1 even + 3 odd
      const evenPool = Array.from({ length: Math.floor((max - min) / 2) + 1 }, (_, i) => min + i * 2).filter(
        (n) => n % 2 === 0,
      );
      const oddPool = Array.from({ length: Math.ceil((max - min) / 2) }, (_, i) => min + i * 2 + 1).filter(
        (n) => n % 2 !== 0,
      );
      correct = randomChoice(evenPool, rng);
      const oddSet = new Set<number>();
      while (oddSet.size < 3) oddSet.add(randomChoice(oddPool, rng));
      others = Array.from(oddSet);
      break;
    }
    case 'odd': {
      // 1 odd + 3 even
      const oddPool = Array.from({ length: Math.ceil((max - min) / 2) }, (_, i) => min + i * 2 + 1).filter(
        (n) => n % 2 !== 0,
      );
      const evenPool = Array.from({ length: Math.floor((max - min) / 2) + 1 }, (_, i) => min + i * 2).filter(
        (n) => n % 2 === 0,
      );
      correct = randomChoice(oddPool, rng);
      const evenSet = new Set<number>();
      while (evenSet.size < 3) evenSet.add(randomChoice(evenPool, rng));
      others = Array.from(evenSet);
      break;
    }
    case 'closest_to_10': {
      // Generate nums where exactly one is uniquely closest to 10
      let nums: number[] = [];
      let attempts = 0;
      do {
        nums = uniqueInts(4, min, max, rng);
        const sorted = [...nums].sort((a, b) => Math.abs(a - 10) - Math.abs(b - 10));
        attempts++;
        if (Math.abs(sorted[0]! - 10) !== Math.abs(sorted[1]! - 10)) break;
      } while (attempts < 50);
      const sortedByDist = [...nums].sort((a, b) => Math.abs(a - 10) - Math.abs(b - 10));
      correct = sortedByDist[0]!;
      others = nums.filter((n) => n !== correct);
      break;
    }
    case 'prime':
    default: {
      // 1 prime + 3 non-primes in range
      const primes = Array.from({ length: max - min + 1 }, (_, i) => min + i).filter(isPrime);
      const nonPrimes = Array.from({ length: max - min + 1 }, (_, i) => min + i).filter(
        (n) => !isPrime(n) && n > 1,
      );
      correct = randomChoice(primes.length > 0 ? primes : [2, 3, 5, 7], rng);
      const npSet = new Set<number>();
      let att = 0;
      while (npSet.size < 3 && att < 200) {
        npSet.add(randomChoice(nonPrimes, rng));
        att++;
      }
      others = Array.from(npSet);
      break;
    }
  }

  const { options, correctIndex } = shuffledWithCorrect(correct, others, rng);

  return {
    type: 'instruction_flip',
    prompt: RULE_PROMPTS[rule],
    options,
    correctIndex,
    meta: { rule },
  };
}
