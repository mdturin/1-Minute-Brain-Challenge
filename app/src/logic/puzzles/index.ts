import type { Puzzle, PuzzleType } from './types';
import type { Difficulty } from '../difficulty';
import { generateMentalMathPuzzle } from './mentalMath';
import { generateMemorySequencePuzzle } from './memorySequence';
import { generateLogicMiniPuzzle } from './logicMini';
import { generatePatternVisualPuzzle } from './patternVisual';

const puzzleGenerators: Record<PuzzleType, (difficulty: Difficulty) => Puzzle> = {
  mental_math: generateMentalMathPuzzle,
  memory_sequence: generateMemorySequencePuzzle,
  logic_mini: generateLogicMiniPuzzle,
  pattern_visual: generatePatternVisualPuzzle,
};

const puzzleTypes: PuzzleType[] = ['mental_math', 'memory_sequence', 'logic_mini', 'pattern_visual'];

export function generateRandomPuzzle(difficulty: Difficulty, previousType?: PuzzleType): Puzzle {
  const availableTypes =
    previousType != null && puzzleTypes.length > 1
      ? puzzleTypes.filter((t) => t !== previousType)
      : puzzleTypes;

  const randomIndex = Math.floor(Math.random() * availableTypes.length);
  const type = availableTypes[randomIndex];
  const generator = puzzleGenerators[type];
  return generator(difficulty);
}

export type { Puzzle, PuzzleType } from './types';

