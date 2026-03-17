/// <reference types="jest" />

import { generateOddOneOutPuzzle } from './oddOneOut';
import type { Difficulty } from '../difficulty';

const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

describe('generateOddOneOutPuzzle', () => {
  test('returns correct puzzle shape for each difficulty', () => {
    difficulties.forEach((difficulty) => {
      const puzzle = generateOddOneOutPuzzle(difficulty);

      expect(puzzle.type).toBe('odd_one_out');
      expect(typeof puzzle.prompt).toBe('string');
      expect(puzzle.prompt.length).toBeGreaterThan(0);
      expect(Array.isArray(puzzle.options)).toBe(true);
      expect(puzzle.options).toHaveLength(4);
      expect(puzzle.correctIndex).toBeGreaterThanOrEqual(0);
      expect(puzzle.correctIndex).toBeLessThan(4);
    });
  });

  test('correct answer is always present in options at correctIndex', () => {
    difficulties.forEach((difficulty) => {
      for (let i = 0; i < 15; i++) {
        const puzzle = generateOddOneOutPuzzle(difficulty);
        expect(puzzle.options[puzzle.correctIndex]).toBeTruthy();
      }
    });
  });

  test('all 4 options are non-empty strings', () => {
    difficulties.forEach((difficulty) => {
      const puzzle = generateOddOneOutPuzzle(difficulty);
      puzzle.options.forEach((opt) => {
        expect(typeof opt).toBe('string');
        expect(opt.length).toBeGreaterThan(0);
      });
    });
  });

  test('options are shuffled (correctIndex varies across runs)', () => {
    const indexes = new Set<number>();
    for (let i = 0; i < 30; i++) {
      const puzzle = generateOddOneOutPuzzle('easy');
      indexes.add(puzzle.correctIndex);
    }
    // Over 30 runs, the correct answer should appear in more than one position
    expect(indexes.size).toBeGreaterThan(1);
  });
});
