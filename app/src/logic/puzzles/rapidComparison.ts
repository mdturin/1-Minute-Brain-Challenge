import type { Puzzle } from './types';
import type { Difficulty } from '../difficulty';

function randomInt(min: number, max: number, rng?: () => number): number {
  return Math.floor((rng ?? Math.random)() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[], rng?: () => number): T[] {
  return [...arr].sort(() => (rng ?? Math.random)() - 0.5);
}

type ComparisonItem = {
  display: string;
  value: number;
};

function makePair(difficulty: Difficulty, rng?: () => number): [ComparisonItem, ComparisonItem] {
  if (difficulty === 'easy') {
    // Simple integers, clearly different
    const a = randomInt(1, 99, rng);
    let b = randomInt(1, 99, rng);
    while (Math.abs(a - b) < 5 || b === a) b = randomInt(1, 99, rng);
    return [
      { display: String(a), value: a },
      { display: String(b), value: b },
    ];
  }

  if (difficulty === 'medium') {
    // Fractions or decimals
    const type = randomInt(0, 1, rng);
    if (type === 0) {
      // Decimals close together
      const base = randomInt(1, 9, rng);
      const decA = randomInt(10, 99, rng);
      let decB = randomInt(10, 99, rng);
      while (Math.abs(decA - decB) < 3 || decB === decA) decB = randomInt(10, 99, rng);
      const a = base + decA / 100;
      const b = base + decB / 100;
      return [
        { display: a.toFixed(2), value: a },
        { display: b.toFixed(2), value: b },
      ];
    } else {
      // Simple fractions: n/d where d in [2..10]
      const dA = randomInt(2, 10, rng);
      const nA = randomInt(1, dA - 1, rng);
      const dB = randomInt(2, 10, rng);
      let nB = randomInt(1, dB - 1, rng);
      const vA = nA / dA;
      let vB = nB / dB;
      while (Math.abs(vA - vB) < 0.05 || vA === vB) {
        nB = randomInt(1, dB - 1, rng);
        vB = nB / dB;
      }
      return [
        { display: `${nA}/${dA}`, value: vA },
        { display: `${nB}/${dB}`, value: vB },
      ];
    }
  }

  // Hard: percentages or mixed (fraction vs decimal)
  const type = randomInt(0, 1, rng);
  if (type === 0) {
    // Percentages close together
    const a = randomInt(10, 95, rng);
    let b = randomInt(10, 95, rng);
    while (Math.abs(a - b) < 3 || b === a) b = randomInt(10, 95, rng);
    return [
      { display: `${a}%`, value: a },
      { display: `${b}%`, value: b },
    ];
  } else {
    // Fraction vs percentage (same range)
    const d = randomInt(3, 8, rng);
    const n = randomInt(1, d - 1, rng);
    const vA = n / d;
    const pct = Math.round(vA * 100);
    const offset = randomInt(3, 12, rng) * (randomInt(0, 1, rng) === 0 ? 1 : -1);
    const pctB = Math.max(5, Math.min(95, pct + offset));
    const vB = pctB / 100;
    return [
      { display: `${n}/${d}`, value: vA },
      { display: `${pctB}%`, value: vB },
    ];
  }
}

export function generateRapidComparisonPuzzle(difficulty: Difficulty, rng?: () => number): Puzzle {
  const [itemA, itemB] = makePair(difficulty, rng);

  const biggerItem = itemA.value > itemB.value ? itemA : itemB;
  const smallerItem = itemA.value < itemB.value ? itemA : itemB;

  // Question: pick bigger or smaller (50/50)
  const askBigger = randomInt(0, 1, rng) === 1;
  const correctDisplay = askBigger ? biggerItem.display : smallerItem.display;

  // Options: the two items + 2 distractors
  // For simplicity, options are just the two items (simpler UX for comparison)
  const shuffled = shuffle([itemA.display, itemB.display], rng);
  const correctIndex = shuffled.indexOf(correctDisplay);

  const questionWord = askBigger ? 'BIGGER' : 'SMALLER';

  return {
    type: 'rapid_comparison',
    prompt: `${itemA.display}  vs  ${itemB.display}`,
    options: shuffled,
    correctIndex,
    meta: { askBigger, questionWord },
  };
}
