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

function makeTriple(difficulty: Difficulty, rng?: () => number): [ComparisonItem, ComparisonItem, ComparisonItem] {
  if (difficulty === 'easy') {
    // Use non-overlapping buckets for guaranteed wide spread
    const useNegatives = (rng ?? Math.random)() < 0.3;
    const buckets: Array<[number, number]> = useNegatives
      ? [[-50, -10], [10, 40], [50, 99]]
      : [[1, 25], [35, 65], [75, 99]];
    // Shuffle bucket assignment so numbers aren't always in ascending order
    const shuffledBuckets = shuffle(buckets, rng);
    const a = randomInt(shuffledBuckets[0]![0], shuffledBuckets[0]![1], rng);
    const b = randomInt(shuffledBuckets[1]![0], shuffledBuckets[1]![1], rng);
    const c = randomInt(shuffledBuckets[2]![0], shuffledBuckets[2]![1], rng);
    return [
      { display: String(a), value: a },
      { display: String(b), value: b },
      { display: String(c), value: c },
    ];
  }

  if (difficulty === 'medium') {
    const type = randomInt(0, 1, rng);
    if (type === 0) {
      // Decimals
      const base = randomInt(1, 9, rng);
      const decA = randomInt(10, 99, rng);
      let decB = randomInt(10, 99, rng);
      while (Math.abs(decA - decB) < 3 || decB === decA) decB = randomInt(10, 99, rng);
      let decC = randomInt(10, 99, rng);
      while (Math.abs(decA - decC) < 3 || Math.abs(decB - decC) < 3 || decC === decA || decC === decB) decC = randomInt(10, 99, rng);
      const a = base + decA / 100;
      const b = base + decB / 100;
      const c = base + decC / 100;
      return [
        { display: a.toFixed(2), value: a },
        { display: b.toFixed(2), value: b },
        { display: c.toFixed(2), value: c },
      ];
    } else {
      // Fractions
      const dA = randomInt(2, 10, rng);
      const nA = randomInt(1, dA - 1, rng);
      const vA = nA / dA;
      const dB = randomInt(2, 10, rng);
      let nB = randomInt(1, dB - 1, rng);
      let vB = nB / dB;
      while (Math.abs(vA - vB) < 0.05 || vA === vB) { nB = randomInt(1, dB - 1, rng); vB = nB / dB; }
      const dC = randomInt(2, 10, rng);
      let nC = randomInt(1, dC - 1, rng);
      let vC = nC / dC;
      while (Math.abs(vA - vC) < 0.05 || Math.abs(vB - vC) < 0.05 || vA === vC || vB === vC) { nC = randomInt(1, dC - 1, rng); vC = nC / dC; }
      return [
        { display: `${nA}/${dA}`, value: vA },
        { display: `${nB}/${dB}`, value: vB },
        { display: `${nC}/${dC}`, value: vC },
      ];
    }
  }

  // Hard
  const type = randomInt(0, 1, rng);
  if (type === 0) {
    // 3 percentages
    const a = randomInt(10, 95, rng);
    let b = randomInt(10, 95, rng);
    while (Math.abs(a - b) < 3 || b === a) b = randomInt(10, 95, rng);
    let c = randomInt(10, 95, rng);
    while (Math.abs(a - c) < 3 || Math.abs(b - c) < 3 || c === a || c === b) c = randomInt(10, 95, rng);
    return [
      { display: `${a}%`, value: a },
      { display: `${b}%`, value: b },
      { display: `${c}%`, value: c },
    ];
  } else {
    // Fraction vs 2 percentages
    const d = randomInt(3, 8, rng);
    const n = randomInt(1, d - 1, rng);
    const vA = n / d;
    const pct = Math.round(vA * 100);
    const offsetB = randomInt(3, 12, rng) * (randomInt(0, 1, rng) === 0 ? 1 : -1);
    const pctB = Math.max(5, Math.min(95, pct + offsetB));
    const vB = pctB / 100;
    let offsetC = randomInt(3, 12, rng) * (randomInt(0, 1, rng) === 0 ? 1 : -1);
    let pctC = Math.max(5, Math.min(95, pct + offsetC));
    while (pctC === pctB || Math.abs(pctC - pctB) < 3) {
      offsetC = randomInt(3, 12, rng) * (randomInt(0, 1, rng) === 0 ? 1 : -1);
      pctC = Math.max(5, Math.min(95, pct + offsetC));
    }
    const vC = pctC / 100;
    return [
      { display: `${n}/${d}`, value: vA },
      { display: `${pctB}%`, value: vB },
      { display: `${pctC}%`, value: vC },
    ];
  }
}

export function generateRapidComparisonPuzzle(difficulty: Difficulty, rng?: () => number): Puzzle {
  const [itemA, itemB, itemC] = makeTriple(difficulty, rng);
  const items = [itemA, itemB, itemC];

  const biggest = items.reduce((a, b) => a.value > b.value ? a : b);
  const smallest = items.reduce((a, b) => a.value < b.value ? a : b);

  // Question: pick bigger or smaller (50/50)
  const askBigger = randomInt(0, 1, rng) === 1;
  const correctDisplay = askBigger ? biggest.display : smallest.display;

  const shuffledItems = shuffle(items, rng);
  const correctIndex = shuffledItems.findIndex((item) => item.display === correctDisplay);
  const shuffled = shuffledItems.map((item) => item.display);

  const questionWord = askBigger ? 'BIGGER' : 'SMALLER';

  return {
    type: 'rapid_comparison',
    prompt: `${itemA.display}  vs  ${itemB.display}  vs  ${itemC.display}`,
    options: shuffled,
    correctIndex,
    meta: { askBigger, questionWord },
  };
}
