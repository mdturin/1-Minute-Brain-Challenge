/// <reference types="jest" />

import { generateSymbolCountPuzzle } from './symbolCount';
import type { Difficulty } from '../difficulty';

const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

describe('generateSymbolCountPuzzle', () => {
  test('returns correct puzzle shape for each difficulty', () => {
    difficulties.forEach((difficulty) => {
      const puzzle = generateSymbolCountPuzzle(difficulty);

      expect(puzzle.type).toBe('symbol_count');
      expect(typeof puzzle.prompt).toBe('string');
      expect(puzzle.prompt.length).toBeGreaterThan(0);
      expect(Array.isArray(puzzle.options)).toBe(true);
      expect(puzzle.options).toHaveLength(4);
      expect(puzzle.correctIndex).toBeGreaterThanOrEqual(0);
      expect(puzzle.correctIndex).toBeLessThan(4);
    });
  });

  test('all options are numeric strings', () => {
    difficulties.forEach((difficulty) => {
      const puzzle = generateSymbolCountPuzzle(difficulty);
      puzzle.options.forEach((opt) => {
        expect(Number.isNaN(Number(opt))).toBe(false);
      });
    });
  });

  test('correct answer is a positive number', () => {
    difficulties.forEach((difficulty) => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generateSymbolCountPuzzle(difficulty);
        const answer = Number(puzzle.options[puzzle.correctIndex]);
        expect(answer).toBeGreaterThan(0);
      }
    });
  });

  test('all options are distinct', () => {
    difficulties.forEach((difficulty) => {
      for (let i = 0; i < 5; i++) {
        const puzzle = generateSymbolCountPuzzle(difficulty);
        const unique = new Set(puzzle.options);
        expect(unique.size).toBe(puzzle.options.length);
      }
    });
  });

  test('prompt contains grid with symbols', () => {
    difficulties.forEach((difficulty) => {
      const puzzle = generateSymbolCountPuzzle(difficulty);
      // Prompt should contain a newline separating question from grid
      expect(puzzle.prompt).toContain('\n\n');
    });
  });

  test('easy uses 3x3 grid (9 cells max), hard uses 4x4 grid (16 cells max)', () => {
    // Easy: 3x3 = 9 symbols total in grid
    for (let i = 0; i < 10; i++) {
      const easy = generateSymbolCountPuzzle('easy');
      const correctCount = Number(easy.options[easy.correctIndex]);
      expect(correctCount).toBeGreaterThanOrEqual(0);
      expect(correctCount).toBeLessThanOrEqual(9);
    }
    // Hard: 4x4 = 16 symbols total in grid
    for (let i = 0; i < 10; i++) {
      const hard = generateSymbolCountPuzzle('hard');
      const correctCount = Number(hard.options[hard.correctIndex]);
      expect(correctCount).toBeGreaterThanOrEqual(0);
      expect(correctCount).toBeLessThanOrEqual(16);
    }
  });
});
