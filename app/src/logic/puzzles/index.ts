import type { Puzzle, PuzzleType } from './types';
import { generateMentalMathPuzzle } from './mentalMath';
import { generateMemorySequencePuzzle } from './memorySequence';
import { generateLogicMiniPuzzle } from './logicMini';

const puzzleGenerators: Record<PuzzleType, () => Puzzle> = {
  mental_math: generateMentalMathPuzzle,
  memory_sequence: generateMemorySequencePuzzle,
  logic_mini: generateLogicMiniPuzzle,
};

const puzzleTypes: PuzzleType[] = ['mental_math', 'memory_sequence', 'logic_mini'];

export function generateRandomPuzzle(previousType?: PuzzleType): Puzzle {
  const availableTypes =
    previousType != null && puzzleTypes.length > 1
      ? puzzleTypes.filter((t) => t !== previousType)
      : puzzleTypes;

  const randomIndex = Math.floor(Math.random() * availableTypes.length);
  const type = availableTypes[randomIndex];
  const generator = puzzleGenerators[type];
  return generator();
}

export type { Puzzle, PuzzleType } from './types';

