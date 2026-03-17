/// <reference types="jest" />

import { generateWordScramblePuzzle } from './wordScramble';
import type { Difficulty } from '../difficulty';

const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

describe('generateWordScramblePuzzle', () => {
  test('returns correct puzzle shape for each difficulty', () => {
    difficulties.forEach((difficulty) => {
      const puzzle = generateWordScramblePuzzle(difficulty);

      expect(puzzle.type).toBe('word_scramble');
      expect(typeof puzzle.prompt).toBe('string');
      expect(puzzle.prompt.length).toBeGreaterThan(0);
      expect(Array.isArray(puzzle.options)).toBe(true);
      expect(puzzle.options).toHaveLength(4);
      expect(puzzle.correctIndex).toBeGreaterThanOrEqual(0);
      expect(puzzle.correctIndex).toBeLessThan(4);
    });
  });

  test('correct answer is always in options at correctIndex', () => {
    difficulties.forEach((difficulty) => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generateWordScramblePuzzle(difficulty);
        const correct = puzzle.options[puzzle.correctIndex];
        expect(correct).toBeTruthy();
        expect(typeof correct).toBe('string');
      }
    });
  });

  test('all options are non-empty strings', () => {
    difficulties.forEach((difficulty) => {
      const puzzle = generateWordScramblePuzzle(difficulty);
      puzzle.options.forEach((opt) => {
        expect(typeof opt).toBe('string');
        expect(opt.length).toBeGreaterThan(0);
      });
    });
  });

  test('options are all distinct', () => {
    difficulties.forEach((difficulty) => {
      for (let i = 0; i < 5; i++) {
        const puzzle = generateWordScramblePuzzle(difficulty);
        const unique = new Set(puzzle.options);
        expect(unique.size).toBe(puzzle.options.length);
      }
    });
  });

  test('prompt contains the scrambled word section', () => {
    difficulties.forEach((difficulty) => {
      const puzzle = generateWordScramblePuzzle(difficulty);
      // Prompt should contain a double-newline separating instruction from scrambled word
      expect(puzzle.prompt).toContain('\n\n');
    });
  });
});
