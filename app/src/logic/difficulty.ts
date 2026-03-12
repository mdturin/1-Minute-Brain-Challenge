export type Difficulty = 'easy' | 'medium' | 'hard';

export type DifficultyConfig = {
  key: Difficulty;
  label: string;
  ageRangeLabel: string;
  description: string;
  baseScoreMultiplier: number;
};

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: {
    key: 'easy',
    label: 'Easy',
    ageRangeLabel: 'Ages 10–14',
    description: 'Relaxed pace with simpler puzzles.',
    baseScoreMultiplier: 1,
  },
  medium: {
    key: 'medium',
    label: 'Medium',
    ageRangeLabel: 'Ages 15–22',
    description: 'Balanced challenge and pace.',
    baseScoreMultiplier: 1.5,
  },
  hard: {
    key: 'hard',
    label: 'Hard',
    ageRangeLabel: 'Ages 23+',
    description: 'Fast, demanding brain workout.',
    baseScoreMultiplier: 2,
  },
};

export const orderedDifficulties: Difficulty[] = ['easy', 'medium', 'hard'];

