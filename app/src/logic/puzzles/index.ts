import type { Puzzle, PuzzleType } from './types';
import type { Difficulty } from '../difficulty';
import { generateMentalMathPuzzle } from './mentalMath';
import { generateMemorySequencePuzzle } from './memorySequence';
import { generateLogicMiniPuzzle } from './logicMini';
import { generatePatternVisualPuzzle } from './patternVisual';
import { generateWordScramblePuzzle } from './wordScramble';
import { generateOddOneOutPuzzle } from './oddOneOut';
import { generateSymbolCountPuzzle } from './symbolCount';
import { generateDualTaskPuzzle } from './dualTask';
import { generateInstructionFlipPuzzle } from './instructionFlip';
import { generateTimeDelayedPuzzle } from './timeDelayed';
import { generateReverseLogicPuzzle } from './reverseLogic';
import { generateMultiStepPuzzle } from './multiStep';
import { generateFakePatternPuzzle } from './fakePattern';
import { generateHiddenRulePuzzle } from './hiddenRule';
import { generateRapidComparisonPuzzle } from './rapidComparison';
import { generateGoNoGoPuzzle } from './goNoGo';
import { generateStroopEffectPuzzle } from './stroopEffect';
import { generateCountDistractionPuzzle } from './countDistraction';
import { generateSpotMisspellingPuzzle } from './spotMisspelling';
import { generateCategoryClashPuzzle } from './categoryClash';

const puzzleGenerators: Record<PuzzleType, (difficulty: Difficulty, rng?: () => number) => Puzzle> = {
  mental_math: generateMentalMathPuzzle,
  memory_sequence: generateMemorySequencePuzzle,
  logic_mini: generateLogicMiniPuzzle,
  pattern_visual: generatePatternVisualPuzzle,
  word_scramble: generateWordScramblePuzzle,
  odd_one_out: generateOddOneOutPuzzle,
  symbol_count: generateSymbolCountPuzzle,
  dual_task: generateDualTaskPuzzle,
  instruction_flip: generateInstructionFlipPuzzle,
  time_delayed: generateTimeDelayedPuzzle,
  reverse_logic: generateReverseLogicPuzzle,
  multi_step: generateMultiStepPuzzle,
  fake_pattern: generateFakePatternPuzzle,
  hidden_rule: generateHiddenRulePuzzle,
  rapid_comparison: generateRapidComparisonPuzzle,
  go_no_go: generateGoNoGoPuzzle,
  stroop_effect: generateStroopEffectPuzzle,
  count_distraction: generateCountDistractionPuzzle,
  spot_misspelling: generateSpotMisspellingPuzzle,
  category_clash: generateCategoryClashPuzzle,
};

const puzzleTypes: PuzzleType[] = [
  'mental_math',
  'memory_sequence',
  'logic_mini',
  'pattern_visual',
  'word_scramble',
  'odd_one_out',
  'symbol_count',
  'dual_task',
  'instruction_flip',
  'time_delayed',
  'reverse_logic',
  'multi_step',
  'fake_pattern',
  'hidden_rule',
  'rapid_comparison',
  'go_no_go',
  'stroop_effect',
  'count_distraction',
  'spot_misspelling',
  'category_clash',
];

export function generateRandomPuzzle(
  difficulty: Difficulty,
  recentTypes?: PuzzleType[],
  rng?: () => number,
): Puzzle {
  const exclusions = recentTypes ?? [];
  const availableTypes =
    exclusions.length > 0 && puzzleTypes.length > exclusions.length
      ? puzzleTypes.filter((t) => !exclusions.includes(t))
      : puzzleTypes;

  const randomIndex = Math.floor((rng ?? Math.random)() * availableTypes.length);
  const type = availableTypes[randomIndex]!;
  const generator = puzzleGenerators[type];
  return generator(difficulty, rng);
}

export type { Puzzle, PuzzleType } from './types';


