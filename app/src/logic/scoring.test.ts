/// <reference types="jest" />

import { calculateScoreForAnswer } from './scoring';
import type { Puzzle } from './puzzles';

// Minimal puzzle stub — scoring doesn't use puzzle content
const dummyPuzzle: Puzzle = {
  id: 'test-1',
  type: 'mentalMath',
  prompt: '2 + 2',
  options: ['3', '4', '5', '6'],
  correctIndex: 1,
} as any;

describe('calculateScoreForAnswer', () => {
  test('returns 0 for incorrect answer', () => {
    expect(calculateScoreForAnswer({
      puzzle: dummyPuzzle,
      difficulty: 'easy',
      isCorrect: false,
      remainingFraction: 1,
    })).toBe(0);
  });

  test('returns 0 for incorrect answer regardless of remaining fraction', () => {
    expect(calculateScoreForAnswer({
      puzzle: dummyPuzzle,
      difficulty: 'hard',
      isCorrect: false,
      remainingFraction: 0.9,
    })).toBe(0);
  });

  describe('easy difficulty (multiplier 1x)', () => {
    test('returns 100 base with no time remaining', () => {
      expect(calculateScoreForAnswer({
        puzzle: dummyPuzzle,
        difficulty: 'easy',
        isCorrect: true,
        remainingFraction: 0,
      })).toBe(100);
    });

    test('returns 150 with full time remaining (50% bonus)', () => {
      expect(calculateScoreForAnswer({
        puzzle: dummyPuzzle,
        difficulty: 'easy',
        isCorrect: true,
        remainingFraction: 1,
      })).toBe(150);
    });

    test('returns 125 with half time remaining', () => {
      expect(calculateScoreForAnswer({
        puzzle: dummyPuzzle,
        difficulty: 'easy',
        isCorrect: true,
        remainingFraction: 0.5,
      })).toBe(125);
    });
  });

  describe('medium difficulty (multiplier 1.5x)', () => {
    test('returns 150 base with no time remaining', () => {
      expect(calculateScoreForAnswer({
        puzzle: dummyPuzzle,
        difficulty: 'medium',
        isCorrect: true,
        remainingFraction: 0,
      })).toBe(150);
    });

    test('returns 200 with full time remaining', () => {
      expect(calculateScoreForAnswer({
        puzzle: dummyPuzzle,
        difficulty: 'medium',
        isCorrect: true,
        remainingFraction: 1,
      })).toBe(200);
    });
  });

  describe('hard difficulty (multiplier 2x)', () => {
    test('returns 200 base with no time remaining', () => {
      expect(calculateScoreForAnswer({
        puzzle: dummyPuzzle,
        difficulty: 'hard',
        isCorrect: true,
        remainingFraction: 0,
      })).toBe(200);
    });

    test('returns 250 with full time remaining', () => {
      expect(calculateScoreForAnswer({
        puzzle: dummyPuzzle,
        difficulty: 'hard',
        isCorrect: true,
        remainingFraction: 1,
      })).toBe(250);
    });
  });

  describe('remainingFraction clamping', () => {
    test('clamps remainingFraction above 1 to 1', () => {
      const unclamped = calculateScoreForAnswer({
        puzzle: dummyPuzzle, difficulty: 'easy', isCorrect: true, remainingFraction: 99,
      });
      const clamped = calculateScoreForAnswer({
        puzzle: dummyPuzzle, difficulty: 'easy', isCorrect: true, remainingFraction: 1,
      });
      expect(unclamped).toBe(clamped);
    });

    test('clamps negative remainingFraction to 0', () => {
      const unclamped = calculateScoreForAnswer({
        puzzle: dummyPuzzle, difficulty: 'easy', isCorrect: true, remainingFraction: -5,
      });
      const clamped = calculateScoreForAnswer({
        puzzle: dummyPuzzle, difficulty: 'easy', isCorrect: true, remainingFraction: 0,
      });
      expect(unclamped).toBe(clamped);
    });
  });
});
