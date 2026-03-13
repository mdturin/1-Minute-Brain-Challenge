/// <reference types="jest" />

import { generateLogicMiniPuzzle } from './logicMini';
import type { Difficulty } from '../difficulty';

const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

describe('generateLogicMiniPuzzle', () => {
  test('returns a valid puzzle shape for each difficulty', () => {
    difficulties.forEach((difficulty) => {
      const puzzle = generateLogicMiniPuzzle(difficulty);

      expect(puzzle.type).toBe('logic_mini');
      expect(typeof puzzle.prompt).toBe('string');
      expect(Array.isArray(puzzle.options)).toBe(true);
      expect(puzzle.options.length).toBeGreaterThanOrEqual(4);
      expect(puzzle.correctIndex).toBeGreaterThanOrEqual(0);
      expect(puzzle.correctIndex).toBeLessThan(puzzle.options.length);
    });
  });

  test('always includes the correct answer among options', () => {
    difficulties.forEach((difficulty) => {
      const puzzle = generateLogicMiniPuzzle(difficulty);
      const correct = puzzle.options[puzzle.correctIndex];

      expect(puzzle.options).toContain(correct);
    });
  });
});

