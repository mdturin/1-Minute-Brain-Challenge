import type { Puzzle } from './types';
import type { Difficulty } from '../difficulty';

const SYMBOL_CHARS: Record<string, string> = {
  circle:   '◯',
  square:   '■',
  triangle: '▲',
  star:     '★',
  diamond:  '◆',
  heart:    '♥',
};

const ALL_SYMBOLS = Object.keys(SYMBOL_CHARS);

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function buildDistractors(correct: number, count: number, min = 0): number[] {
  const set = new Set<number>();
  let attempts = 0;
  while (set.size < count && attempts < 200) {
    attempts++;
    const delta = randomInt(1, 3) * (Math.random() > 0.5 ? 1 : -1);
    const candidate = correct + delta;
    if (candidate >= min && candidate !== correct) set.add(candidate);
  }
  return Array.from(set);
}

export function generateSymbolCountPuzzle(difficulty: Difficulty): Puzzle {
  let rows: number;
  let cols: number;
  let symbolCount: number; // how many distinct symbols to use

  switch (difficulty) {
    case 'easy':
      rows = 3; cols = 3; symbolCount = 2;
      break;
    case 'medium':
      rows = 4; cols = 4; symbolCount = 3;
      break;
    case 'hard':
      rows = 4; cols = 4; symbolCount = 4;
      break;
    default:
      rows = 3; cols = 3; symbolCount = 2;
  }

  // Pick which symbols to use
  const usedSymbols = [...ALL_SYMBOLS].sort(() => Math.random() - 0.5).slice(0, symbolCount);
  const targetSymbol = randomChoice(usedSymbols);

  // Fill grid randomly using only usedSymbols
  const totalCells = rows * cols;
  const grid: string[] = Array.from({ length: totalCells }, () => randomChoice(usedSymbols));

  // Count target symbol occurrences
  const correctCount = grid.filter((s) => s === targetSymbol).length;

  // Build grid display
  const gridLines: string[] = [];
  for (let r = 0; r < rows; r++) {
    const rowSymbols = grid.slice(r * cols, (r + 1) * cols);
    gridLines.push(rowSymbols.map((s) => SYMBOL_CHARS[s]!).join('  '));
  }
  const gridDisplay = gridLines.join('\n');

  const targetChar = SYMBOL_CHARS[targetSymbol]!;
  const prompt = `How many ${targetChar} are in the grid?\n\n${gridDisplay}`;

  // Build options
  const distractors = buildDistractors(correctCount, 3, 0);
  const optionsArr = [...distractors, correctCount].sort(() => Math.random() - 0.5);
  const correctIndex = optionsArr.indexOf(correctCount);

  return {
    type: 'symbol_count',
    prompt,
    options: optionsArr.map(String),
    correctIndex,
  };
}
