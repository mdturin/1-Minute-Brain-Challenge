import type { Puzzle } from './types';
import type { Difficulty } from '../difficulty';
import type { PatternVisualMeta, PatternVisualSymbolKey } from './types';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const SYMBOLS: PatternVisualSymbolKey[] = ['circle', 'square', 'triangle', 'star'];

type VisualTemplate = {
  rows: number;
  cols: number;
  buildGrid: () => {
    grid: (PatternVisualSymbolKey | null)[][];
    missingPosition: { row: number; col: number };
    correctSymbol: PatternVisualSymbolKey;
  };
};

function makeEasyTemplates(): VisualTemplate[] {
  // 1x4 sequences like A, B, A, ?
  return SYMBOLS.map<VisualTemplate>((firstSymbol, index) => {
    const secondSymbol = SYMBOLS[(index + 1) % SYMBOLS.length];
    return {
      rows: 1,
      cols: 4,
      buildGrid: () => {
        const grid: (PatternVisualSymbolKey | null)[][] = [[firstSymbol, secondSymbol, firstSymbol, null]];
        const missingPosition = { row: 0, col: 3 };
        const correctSymbol = secondSymbol;
        return { grid, missingPosition, correctSymbol };
      },
    };
  });
}

function makeMediumTemplates(): VisualTemplate[] {
  // 2x2 checkerboard patterns with one missing
  return SYMBOLS.map<VisualTemplate>((firstSymbol, index) => {
    const secondSymbol = SYMBOLS[(index + 1) % SYMBOLS.length];
    return {
      rows: 2,
      cols: 2,
      buildGrid: () => {
        const grid: (PatternVisualSymbolKey | null)[][] = [
          [firstSymbol, secondSymbol],
          [secondSymbol, null],
        ];
        const missingPosition = { row: 1, col: 1 };
        const correctSymbol = firstSymbol;
        return { grid, missingPosition, correctSymbol };
      },
    };
  });
}

function makeHardTemplates(): VisualTemplate[] {
  // 3x3 alternating patterns with center missing
  return SYMBOLS.map<VisualTemplate>((firstSymbol, index) => {
    const secondSymbol = SYMBOLS[(index + 1) % SYMBOLS.length];
    return {
      rows: 3,
      cols: 3,
      buildGrid: () => {
        const grid: (PatternVisualSymbolKey | null)[][] = [];
        for (let r = 0; r < 3; r += 1) {
          const row: (PatternVisualSymbolKey | null)[] = [];
          for (let c = 0; c < 3; c += 1) {
            // Alternate by (row + col)
            const useFirst = (r + c) % 2 === 0;
            row.push(useFirst ? firstSymbol : secondSymbol);
          }
          grid.push(row);
        }
        const missingPosition = { row: 1, col: 1 };
        const correctSymbol = grid[missingPosition.row]![missingPosition.col] as PatternVisualSymbolKey;
        grid[missingPosition.row]![missingPosition.col] = null;
        return { grid, missingPosition, correctSymbol };
      },
    };
  });
}

const EASY_TEMPLATES = makeEasyTemplates();
const MEDIUM_TEMPLATES = makeMediumTemplates();
const HARD_TEMPLATES = makeHardTemplates();

function pickTemplate(difficulty: Difficulty): VisualTemplate {
  let pool: VisualTemplate[];

  switch (difficulty) {
    case 'easy':
      pool = EASY_TEMPLATES;
      break;
    case 'medium':
      pool = MEDIUM_TEMPLATES;
      break;
    case 'hard':
      pool = HARD_TEMPLATES;
      break;
    default:
      pool = [...EASY_TEMPLATES, ...MEDIUM_TEMPLATES];
  }

  const index = randomInt(0, pool.length - 1);
  return pool[index];
}

function buildOptions(correctSymbol: PatternVisualSymbolKey): {
  options: string[];
  optionSymbolKeys: PatternVisualSymbolKey[];
  correctIndex: number;
} {
  const symbolSet = new Set<PatternVisualSymbolKey>();
  symbolSet.add(correctSymbol);

  while (symbolSet.size < 4) {
    const candidate = SYMBOLS[randomInt(0, SYMBOLS.length - 1)];
    symbolSet.add(candidate);
  }

  const optionSymbolKeys = Array.from(symbolSet);
  // Shuffle options
  optionSymbolKeys.sort(() => Math.random() - 0.5);

  const options = optionSymbolKeys.map((symbol) => symbol);
  const correctIndex = optionSymbolKeys.indexOf(correctSymbol);

  return { options, optionSymbolKeys, correctIndex };
}

function buildAsciiRepresentation(meta: PatternVisualMeta): string {
  const symbolToChar: Record<PatternVisualSymbolKey, string> = {
    circle: '◯',
    square: '■',
    triangle: '▲',
    star: '★',
  };

  const lines = meta.grid.map((row) =>
    row
      .map((cell) => {
        if (cell == null) return '?';
        return symbolToChar[cell];
      })
      .join(' '),
  );

  return lines.join('\n');
}

export function generatePatternVisualPuzzle(difficulty: Difficulty): Puzzle {
  const template = pickTemplate(difficulty);
  const { grid, missingPosition, correctSymbol } = template.buildGrid();

  const { options, optionSymbolKeys, correctIndex } = buildOptions(correctSymbol);

  const meta: PatternVisualMeta = {
    rows: template.rows,
    cols: template.cols,
    grid,
    missingPosition,
    optionSymbolKeys,
  };

  const asciiPattern = buildAsciiRepresentation(meta);
  const prompt = `Look at the pattern and choose which symbol completes it:\n\n${asciiPattern}`;

  return {
    type: 'pattern_visual',
    prompt,
    options,
    correctIndex,
    meta: {
      patternVisual: meta,
    },
  };
}

