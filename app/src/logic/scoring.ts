import type { Difficulty } from './difficulty';
import { DIFFICULTIES } from './difficulty';
import type { Puzzle } from './puzzles';

type ScoreInput = {
  puzzle: Puzzle;
  difficulty: Difficulty;
  isCorrect: boolean;
  remainingFraction: number;
};

export function calculateScoreForAnswer({ puzzle, difficulty, isCorrect, remainingFraction }: ScoreInput): number {
  if (!isCorrect) {
    return 0;
  }

  const basePoints = 100;
  const multiplier = DIFFICULTIES[difficulty].baseScoreMultiplier;

  const clampedRemaining = Math.max(0, Math.min(1, remainingFraction));
  const timeBonus = Math.round(basePoints * clampedRemaining * 0.5);

  return Math.round(basePoints * multiplier + timeBonus);
}

