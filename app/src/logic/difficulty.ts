export type Difficulty = 'easy' | 'medium' | 'hard';

export type DifficultyConfig = {
  key: Difficulty;
  label: string;
  description: string;
  baseScoreMultiplier: number;
};

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: {
    key: 'easy',
    label: 'Easy',
    description: 'Relaxed pace with simpler puzzles.',
    baseScoreMultiplier: 1,
  },
  medium: {
    key: 'medium',
    label: 'Medium',
    description: 'Balanced challenge and pace.',
    baseScoreMultiplier: 1.5,
  },
  hard: {
    key: 'hard',
    label: 'Hard',
    description: 'Fast, demanding brain workout.',
    baseScoreMultiplier: 2,
  },
};

export const orderedDifficulties: Difficulty[] = ['easy', 'medium', 'hard'];

