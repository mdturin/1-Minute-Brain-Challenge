import type { Puzzle } from './types';
import type { Difficulty } from '../difficulty';

function randomInt(min: number, max: number, rng?: () => number): number {
  return Math.floor((rng ?? Math.random)() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[], rng?: () => number): T[] {
  return [...arr].sort(() => (rng ?? Math.random)() - 0.5);
}

// Each shape has 4 rotations: 0°, 90°, 180°, 270°
type Shape = {
  name: string;
  rotations: [string, string, string, string]; // 0, 90, 180, 270
};

const SHAPES: Shape[] = [
  {
    name: 'arrow',
    rotations: ['→', '↓', '←', '↑'],
  },
  {
    name: 'diagonal-arrow',
    rotations: ['↗', '↘', '↙', '↖'],
  },
  {
    name: 'L-shape',
    rotations: ['⌐', '¬', '⌐', '¬'], // simplified L variants
  },
  {
    name: 'corner',
    rotations: ['⌐', '⌐', '⌐', '⌐'],
  },
  {
    name: 'triangle',
    rotations: ['▲', '▶', '▼', '◀'],
  },
  {
    name: 'half-circle',
    rotations: ['◑', '◒', '◐', '◓'],
  },
  {
    name: 'flag',
    rotations: ['⚑', '⚐', '⚑', '⚐'],
  },
];

// More visually distinct shapes using block characters
const GRID_SHAPES: Shape[] = [
  {
    name: 'arrow',
    rotations: [
      '  ▲  \n ███ \n  █  ',   // pointing up
      '   █▶\n  ███\n   █ ',   // pointing right
      '  █  \n ███ \n  ▼  ',   // pointing down
      ' █   \n███  \n █   ',   // pointing left
    ],
  },
  {
    name: 'L-shape',
    rotations: [
      '█    \n█    \n███  ',  // L
      '███  \n█    \n█    ',  // L rotated 90
      '███  \n  █  \n  █  ',  // L rotated 180
      '  █  \n  █  \n███  ',  // L rotated 270
    ],
  },
  {
    name: 'T-shape',
    rotations: [
      '███  \n █   \n █   ',  // T pointing down
      ' █   \n██   \n █   ',  // T pointing right
      ' █   \n █   \n███  ',  // T pointing up
      ' █   \n ██  \n █   ',  // T pointing left
    ],
  },
  {
    name: 'checkmark',
    rotations: [
      '  █  \n █   \n█    ',   // ✓ shape
      '█    \n ██  \n   █ ',   // rotated
      '    █\n   █ \n ██  ',   // flipped
      ' █   \n  ██ \n    █',   // other
    ],
  },
];

export function generateVisualRotationPuzzle(difficulty: Difficulty, rng?: () => number): Puzzle {
  const pool = difficulty === 'easy' ? SHAPES : GRID_SHAPES;
  const shape = pool[randomInt(0, pool.length - 1, rng)]!;

  const sourceRotIdx = randomInt(0, 3, rng);
  const correctRotIdx = (sourceRotIdx + randomInt(1, 3, rng)) % 4; // at least 1 step away

  const sourceShape = shape.rotations[sourceRotIdx]!;
  const correctShape = shape.rotations[correctRotIdx]!;

  // Build 3 distractor rotations (exclude correct)
  const allRots = [0, 1, 2, 3].filter((i) => i !== correctRotIdx);
  const shuffledRots = shuffle(allRots, rng).slice(0, 3);
  const distractors = shuffledRots.map((i) => shape.rotations[i]!);

  const allOptions = shuffle([correctShape, ...distractors], rng);
  const correctIndex = allOptions.indexOf(correctShape);

  return {
    type: 'visual_rotation',
    prompt: sourceShape,
    options: allOptions,
    correctIndex,
    meta: { shapeName: shape.name },
  };
}
