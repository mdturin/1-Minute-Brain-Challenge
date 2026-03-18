import type { Puzzle, PuzzleType } from './types';
import type { Difficulty } from '../difficulty';
import { generateMentalMathPuzzle } from './mentalMath';
import { generateMemorySequencePuzzle } from './memorySequence';
import { generateLogicMiniPuzzle } from './logicMini';
import { generatePatternVisualPuzzle } from './patternVisual';
import { generateWordScramblePuzzle } from './wordScramble';
import { generateOddOneOutPuzzle } from './oddOneOut';
import { generateSymbolCountPuzzle } from './symbolCount';

const puzzleGenerators: Record<PuzzleType, (difficulty: Difficulty, rng?: () => number) => Puzzle> = {
  mental_math: generateMentalMathPuzzle,
  memory_sequence: generateMemorySequencePuzzle,
  logic_mini: generateLogicMiniPuzzle,
  pattern_visual: generatePatternVisualPuzzle,
  word_scramble: generateWordScramblePuzzle,
  odd_one_out: generateOddOneOutPuzzle,
  symbol_count: generateSymbolCountPuzzle,
};

const puzzleTypes: PuzzleType[] = [
  'mental_math',
  'memory_sequence',
  'logic_mini',
  'pattern_visual',
  'word_scramble',
  'odd_one_out',
  'symbol_count',
];

export function generateRandomPuzzle(
  difficulty: Difficulty,
  previousType?: PuzzleType,
  rng?: () => number,
): Puzzle {
  const availableTypes =
    previousType != null && puzzleTypes.length > 1
      ? puzzleTypes.filter((t) => t !== previousType)
      : puzzleTypes;

  const randomIndex = Math.floor((rng ?? Math.random)() * availableTypes.length);
  const type = availableTypes[randomIndex];
  const generator = puzzleGenerators[type];
  return generator(difficulty, rng);
}

export type { Puzzle, PuzzleType } from './types';


