import type { Puzzle } from './types';
import type { Difficulty } from '../difficulty';
import type { PatternVisualMeta, PatternVisualSymbolKey } from './types';

function randomInt(min: number, max: number, rng?: () => number): number {
  return Math.floor((rng ?? Math.random)() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[], rng?: () => number): T {
  return arr[Math.floor((rng ?? Math.random)() * arr.length)];
}

const SYMBOLS: PatternVisualSymbolKey[] = ['circle', 'square', 'triangle', 'star'];

/** Pick two distinct symbols */
function twoDifferent(rng?: () => number): [PatternVisualSymbolKey, PatternVisualSymbolKey] {
  const shuffled = [...SYMBOLS].sort(() => (rng ?? Math.random)() - 0.5);
  return [shuffled[0]!, shuffled[1]!];
}

/** Pick three distinct symbols */
function threeDifferent(rng?: () => number): [PatternVisualSymbolKey, PatternVisualSymbolKey, PatternVisualSymbolKey] {
  const shuffled = [...SYMBOLS].sort(() => (rng ?? Math.random)() - 0.5);
  return [shuffled[0]!, shuffled[1]!, shuffled[2]!];
}

function buildOptions(correctSymbol: PatternVisualSymbolKey, rng?: () => number): {
  options: string[];
  optionSymbolKeys: PatternVisualSymbolKey[];
  correctIndex: number;
} {
  const set = new Set<PatternVisualSymbolKey>([correctSymbol]);
  while (set.size < 4) {
    set.add(randomChoice(SYMBOLS, rng));
  }
  const optionSymbolKeys = Array.from(set).sort(() => (rng ?? Math.random)() - 0.5);
  return {
    options: optionSymbolKeys.map((s) => s),
    optionSymbolKeys,
    correctIndex: optionSymbolKeys.indexOf(correctSymbol),
  };
}

function buildAsciiRepresentation(meta: PatternVisualMeta): string {
  const symbolToChar: Record<PatternVisualSymbolKey, string> = {
    circle: '◯',
    square: '■',
    triangle: '▲',
    star: '★',
  };
  return meta.grid
    .map((row) => row.map((cell) => (cell == null ? '?' : symbolToChar[cell])).join('  '))
    .join('\n');
}

// ─── EASY GENERATORS ──────────────────────────────────────────────────────────

/** 1×4 ABAB — missing last */
function easy1x4Last(rng?: () => number): ReturnType<typeof makePuzzle> {
  const [A, B] = twoDifferent(rng);
  const grid: (PatternVisualSymbolKey | null)[][] = [[A, B, A, null]];
  return makePuzzle(1, 4, grid, { row: 0, col: 3 }, B);
}

/** 1×4 ABAB — missing first */
function easy1x4First(rng?: () => number): ReturnType<typeof makePuzzle> {
  const [A, B] = twoDifferent(rng);
  const grid: (PatternVisualSymbolKey | null)[][] = [[null, B, A, B]];
  return makePuzzle(1, 4, grid, { row: 0, col: 0 }, A);
}

/** 1×4 ABAB — missing third cell */
function easy1x4ThirdMissing(rng?: () => number): ReturnType<typeof makePuzzle> {
  const [A, B] = twoDifferent(rng);
  const grid: (PatternVisualSymbolKey | null)[][] = [[A, B, null, B]];
  return makePuzzle(1, 4, grid, { row: 0, col: 2 }, A);
}

/** 1×3 ABA — missing middle */
function easy1x3Middle(rng?: () => number): ReturnType<typeof makePuzzle> {
  const [A, B] = twoDifferent(rng);
  const grid: (PatternVisualSymbolKey | null)[][] = [[A, null, A]];
  return makePuzzle(1, 3, grid, { row: 0, col: 1 }, B);
}

/** 1×5 ABABA — missing position varies */
function easy1x5(rng?: () => number): ReturnType<typeof makePuzzle> {
  const [A, B] = twoDifferent(rng);
  const pattern = [A, B, A, B, A];
  const missingCol = randomChoice([0, 1, 2, 3, 4], rng);
  const correct = pattern[missingCol]!;
  const row = pattern.map((s, i) => (i === missingCol ? null : s)) as (PatternVisualSymbolKey | null)[];
  return makePuzzle(1, 5, [row], { row: 0, col: missingCol }, correct);
}

// ─── MEDIUM GENERATORS ────────────────────────────────────────────────────────

/** 2×2 checkerboard — missing varies among 4 cells */
function medium2x2Checkerboard(rng?: () => number): ReturnType<typeof makePuzzle> {
  const [A, B] = twoDifferent(rng);
  const full: PatternVisualSymbolKey[][] = [
    [A, B],
    [B, A],
  ];
  const missingRow = randomChoice([0, 1], rng);
  const missingCol = randomChoice([0, 1], rng);
  const correct = full[missingRow]![missingCol]!;
  const grid: (PatternVisualSymbolKey | null)[][] = full.map((r, ri) =>
    r.map((c, ci) => (ri === missingRow && ci === missingCol ? null : c))
  );
  return makePuzzle(2, 2, grid, { row: missingRow, col: missingCol }, correct);
}

/** 2×3 row-repeat (each row uses same symbol) */
function medium2x3RowRepeat(rng?: () => number): ReturnType<typeof makePuzzle> {
  const [A, B] = twoDifferent(rng);
  const rowSymbols = [A, B];
  const missingRow = randomChoice([0, 1], rng);
  const missingCol = randomInt(0, 2, rng);
  const correct = rowSymbols[missingRow]!;
  const grid: (PatternVisualSymbolKey | null)[][] = rowSymbols.map((sym, ri) =>
    [0, 1, 2].map((ci) => (ri === missingRow && ci === missingCol ? null : sym))
  );
  return makePuzzle(2, 3, grid, { row: missingRow, col: missingCol }, correct);
}

/** 3×1 column rotation (vertical 1×3) — simple */
function medium3x1Column(rng?: () => number): ReturnType<typeof makePuzzle> {
  const [A, B, C] = threeDifferent(rng);
  const pattern = [A, B, C];
  const missingRow = randomChoice([0, 1, 2], rng);
  const correct = pattern[missingRow]!;
  const grid: (PatternVisualSymbolKey | null)[][] = pattern.map((s, i) => [i === missingRow ? null : s]);
  return makePuzzle(3, 1, grid, { row: missingRow, col: 0 }, correct);
}

/** 1×4 ABCD — all four symbols once — missing varies */
function medium1x4AllFour(rng?: () => number): ReturnType<typeof makePuzzle> {
  const shuffled = [...SYMBOLS].sort(() => (rng ?? Math.random)() - 0.5) as PatternVisualSymbolKey[];
  const missingCol = randomChoice([0, 1, 2, 3], rng);
  const correct = shuffled[missingCol]!;
  const row = shuffled.map((s, i) => (i === missingCol ? null : s)) as (PatternVisualSymbolKey | null)[];
  return makePuzzle(1, 4, [row], { row: 0, col: missingCol }, correct);
}

/** 2×2 same symbol per column */
function medium2x2ColumnRepeat(rng?: () => number): ReturnType<typeof makePuzzle> {
  const [A, B] = twoDifferent(rng);
  const full: PatternVisualSymbolKey[][] = [
    [A, B],
    [A, B],
  ];
  const missingRow = randomChoice([0, 1], rng);
  const missingCol = randomChoice([0, 1], rng);
  const correct = full[missingRow]![missingCol]!;
  const grid: (PatternVisualSymbolKey | null)[][] = full.map((r, ri) =>
    r.map((c, ci) => (ri === missingRow && ci === missingCol ? null : c))
  );
  return makePuzzle(2, 2, grid, { row: missingRow, col: missingCol }, correct);
}

// ─── HARD GENERATORS ──────────────────────────────────────────────────────────

/** 3×3 checkerboard — missing position varies (not always center) */
function hard3x3Checkerboard(rng?: () => number): ReturnType<typeof makePuzzle> {
  const [A, B] = twoDifferent(rng);
  const full: PatternVisualSymbolKey[][] = [];
  for (let r = 0; r < 3; r++) {
    const row: PatternVisualSymbolKey[] = [];
    for (let c = 0; c < 3; c++) {
      row.push((r + c) % 2 === 0 ? A : B);
    }
    full.push(row);
  }
  const missingRow = randomInt(0, 2, rng);
  const missingCol = randomInt(0, 2, rng);
  const correct = full[missingRow]![missingCol]!;
  const grid: (PatternVisualSymbolKey | null)[][] = full.map((r, ri) =>
    r.map((c, ci) => (ri === missingRow && ci === missingCol ? null : c))
  );
  return makePuzzle(3, 3, grid, { row: missingRow, col: missingCol }, correct);
}

/** 3×3 diagonal pattern — same symbol along diagonals */
function hard3x3Diagonal(rng?: () => number): ReturnType<typeof makePuzzle> {
  const [A, B, C] = threeDifferent(rng);
  // Diagonal index = (r - c + 4) % 3 maps to A/B/C
  const symMap = [A, B, C];
  const full: PatternVisualSymbolKey[][] = [];
  for (let r = 0; r < 3; r++) {
    const row: PatternVisualSymbolKey[] = [];
    for (let c = 0; c < 3; c++) {
      row.push(symMap[(r - c + 3) % 3]!);
    }
    full.push(row);
  }
  const missingRow = randomInt(0, 2, rng);
  const missingCol = randomInt(0, 2, rng);
  const correct = full[missingRow]![missingCol]!;
  const grid: (PatternVisualSymbolKey | null)[][] = full.map((r, ri) =>
    r.map((c, ci) => (ri === missingRow && ci === missingCol ? null : c))
  );
  return makePuzzle(3, 3, grid, { row: missingRow, col: missingCol }, correct);
}

/** 3×3 row-repeat — each row has its own symbol */
function hard3x3RowRepeat(rng?: () => number): ReturnType<typeof makePuzzle> {
  const [A, B, C] = threeDifferent(rng);
  const rowSymbols = [A, B, C];
  const missingRow = randomInt(0, 2, rng);
  const missingCol = randomInt(0, 2, rng);
  const correct = rowSymbols[missingRow]!;
  const grid: (PatternVisualSymbolKey | null)[][] = rowSymbols.map((sym, ri) =>
    [0, 1, 2].map((ci) => (ri === missingRow && ci === missingCol ? null : sym))
  );
  return makePuzzle(3, 3, grid, { row: missingRow, col: missingCol }, correct);
}

/** 3×3 column-repeat — each column has its own symbol */
function hard3x3ColRepeat(rng?: () => number): ReturnType<typeof makePuzzle> {
  const [A, B, C] = threeDifferent(rng);
  const colSymbols = [A, B, C];
  const missingRow = randomInt(0, 2, rng);
  const missingCol = randomInt(0, 2, rng);
  const correct = colSymbols[missingCol]!;
  const grid: (PatternVisualSymbolKey | null)[][] = [0, 1, 2].map((ri) =>
    colSymbols.map((sym, ci) => (ri === missingRow && ci === missingCol ? null : sym))
  );
  return makePuzzle(3, 3, grid, { row: missingRow, col: missingCol }, correct);
}

/** 2×4 alternating rows */
function hard2x4Alternating(rng?: () => number): ReturnType<typeof makePuzzle> {
  const [A, B] = twoDifferent(rng);
  // Row 0: ABAB, Row 1: BABA
  const full: PatternVisualSymbolKey[][] = [
    [A, B, A, B],
    [B, A, B, A],
  ];
  const missingRow = randomChoice([0, 1], rng);
  const missingCol = randomInt(0, 3, rng);
  const correct = full[missingRow]![missingCol]!;
  const grid: (PatternVisualSymbolKey | null)[][] = full.map((r, ri) =>
    r.map((c, ci) => (ri === missingRow && ci === missingCol ? null : c))
  );
  return makePuzzle(2, 4, grid, { row: missingRow, col: missingCol }, correct);
}

// ─── HELPER ───────────────────────────────────────────────────────────────────
function makePuzzle(
  rows: number,
  cols: number,
  grid: (PatternVisualSymbolKey | null)[][],
  missingPosition: { row: number; col: number },
  correctSymbol: PatternVisualSymbolKey,
): { rows: number; cols: number; grid: (PatternVisualSymbolKey | null)[][]; missingPosition: { row: number; col: number }; correctSymbol: PatternVisualSymbolKey } {
  return { rows, cols, grid, missingPosition, correctSymbol };
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export function generatePatternVisualPuzzle(difficulty: Difficulty, rng?: () => number): Puzzle {
  let result: ReturnType<typeof makePuzzle>;

  if (difficulty === 'easy') {
    const variant = randomChoice([
      easy1x4Last,
      easy1x4First,
      easy1x4ThirdMissing,
      easy1x3Middle,
      easy1x5,
    ], rng);
    result = variant(rng);
  } else if (difficulty === 'medium') {
    const variant = randomChoice([
      medium2x2Checkerboard,
      medium2x3RowRepeat,
      medium3x1Column,
      medium1x4AllFour,
      medium2x2ColumnRepeat,
    ], rng);
    result = variant(rng);
  } else {
    const variant = randomChoice([
      hard3x3Checkerboard,
      hard3x3Diagonal,
      hard3x3RowRepeat,
      hard3x3ColRepeat,
      hard2x4Alternating,
    ], rng);
    result = variant(rng);
  }

  const { rows, cols, grid, missingPosition, correctSymbol } = result;
  const { options, optionSymbolKeys, correctIndex } = buildOptions(correctSymbol, rng);

  const meta: PatternVisualMeta = { rows, cols, grid, missingPosition, optionSymbolKeys };
  const asciiPattern = buildAsciiRepresentation(meta);
  const prompt = `Look at the pattern and choose which symbol completes it:\n\n${asciiPattern}`;

  return {
    type: 'pattern_visual',
    prompt,
    options,
    correctIndex,
    meta: { patternVisual: meta },
  };
}
