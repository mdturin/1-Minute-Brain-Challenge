/// <reference types="jest" />

import { generatePatternVisualPuzzle } from './patternVisual';
import type { Difficulty } from '../difficulty';
import type { PatternVisualMeta } from './types';

const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

describe('generatePatternVisualPuzzle', () => {
  test('returns a valid puzzle shape for each difficulty', () => {
    difficulties.forEach((difficulty) => {
      const puzzle = generatePatternVisualPuzzle(difficulty);

      expect(puzzle.type).toBe('pattern_visual');
      expect(typeof puzzle.prompt).toBe('string');
      expect(Array.isArray(puzzle.options)).toBe(true);
      expect(puzzle.options.length).toBeGreaterThanOrEqual(4);
      expect(puzzle.correctIndex).toBeGreaterThanOrEqual(0);
      expect(puzzle.correctIndex).toBeLessThan(puzzle.options.length);
    });
  });

  test('includes structured patternVisual metadata', () => {
    const puzzle = generatePatternVisualPuzzle('medium');

    expect(puzzle.meta).toBeDefined();
    const meta = (puzzle.meta as { patternVisual?: PatternVisualMeta }).patternVisual;
    expect(meta).toBeDefined();
    expect(meta!.rows).toBeGreaterThan(0);
    expect(meta!.cols).toBeGreaterThan(0);
    expect(meta!.grid.length).toBe(meta!.rows);
    meta!.grid.forEach((row) => {
      expect(row.length).toBe(meta!.cols);
    });
    expect(meta!.missingPosition.row).toBeGreaterThanOrEqual(0);
    expect(meta!.missingPosition.col).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(meta!.optionSymbolKeys)).toBe(true);
    expect(meta!.optionSymbolKeys.length).toBe(puzzle.options.length);
  });
}
);

