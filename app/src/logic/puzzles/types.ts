export type PuzzleType = 'mental_math' | 'memory_sequence' | 'logic_mini' | 'pattern_visual' | 'word_scramble' | 'odd_one_out' | 'symbol_count' | 'dual_task' | 'instruction_flip' | 'time_delayed' | 'reverse_logic' | 'multi_step' | 'fake_pattern' | 'visual_rotation' | 'hidden_rule' | 'rapid_comparison' | 'go_no_go' | 'stroop_effect' | 'count_distraction' | 'spot_misspelling' | 'category_clash';

export type PatternVisualSymbolKey = 'circle' | 'square' | 'triangle' | 'star';

export type PatternVisualMeta = {
  rows: number;
  cols: number;
  /**
   * Grid of symbols representing the visual pattern.
   * A null entry means the symbol at that position is missing and should be filled by the answer.
   */
  grid: (PatternVisualSymbolKey | null)[][];
  missingPosition: {
    row: number;
    col: number;
  };
  /**
   * Symbol keys backing each option in the same order as `options`.
   * UI can map these keys to concrete image or icon assets.
   */
  optionSymbolKeys: PatternVisualSymbolKey[];
};

export type PuzzleMeta = {
  sequence?: number[];
  targetIndex?: number;
  patternVisual?: PatternVisualMeta;
  // Allow generators to store additional metadata as needed.
  [key: string]: unknown;
};

export type MultipleChoicePuzzle = {
  type: PuzzleType;
  prompt: string;
  options: string[];
  correctIndex: number;
  meta?: PuzzleMeta;
};

export type Puzzle = MultipleChoicePuzzle;

