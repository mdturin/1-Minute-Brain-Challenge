export type PuzzleType = 'mental_math' | 'memory_sequence' | 'logic_mini';

export type MultipleChoicePuzzle = {
  type: PuzzleType;
  prompt: string;
  options: string[];
  correctIndex: number;
  meta?: Record<string, unknown>;
};

export type Puzzle = MultipleChoicePuzzle;

