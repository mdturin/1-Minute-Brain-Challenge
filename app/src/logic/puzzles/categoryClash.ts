import type { Puzzle } from './types';
import type { Difficulty } from '../difficulty';

function randomInt(min: number, max: number, rng?: () => number): number {
  return Math.floor((rng ?? Math.random)() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[], rng?: () => number): T[] {
  return [...arr].sort(() => (rng ?? Math.random)() - 0.5);
}

type CategorySet = {
  category: string;          // e.g. "Fruits"
  members: string[];         // items that belong
  traps: string[];           // items that look like they belong but don't
  trapHint?: string;         // why the trap doesn't belong
};

const EASY_SETS: CategorySet[] = [
  {
    category: 'Fruits',
    members: ['Apple', 'Banana', 'Grape', 'Mango', 'Peach', 'Cherry', 'Plum'],
    traps: ['Tomato', 'Cucumber', 'Avocado'],
    trapHint: 'botanically a fruit but not commonly treated as one',
  },
  {
    category: 'Planets',
    members: ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'],
    traps: ['Pluto', 'Moon', 'Sun'],
  },
  {
    category: 'Colors',
    members: ['Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink'],
    traps: ['Gold', 'Silver', 'Bronze'],
  },
  {
    category: 'Mammals',
    members: ['Dog', 'Cat', 'Elephant', 'Horse', 'Lion', 'Bear', 'Whale'],
    traps: ['Shark', 'Eagle', 'Crocodile'],
  },
];

const MEDIUM_SETS: CategorySet[] = [
  {
    category: 'Prime Numbers',
    members: ['2', '3', '5', '7', '11', '13', '17', '19'],
    traps: ['1', '9', '15', '21'],
  },
  {
    category: 'European Countries',
    members: ['France', 'Germany', 'Spain', 'Italy', 'Sweden', 'Poland', 'Greece'],
    traps: ['Turkey', 'Russia', 'Iceland'],
  },
  {
    category: 'Programming Languages',
    members: ['Python', 'Java', 'Swift', 'Kotlin', 'Rust', 'Go', 'Ruby'],
    traps: ['HTML', 'CSS', 'SQL'],
  },
  {
    category: 'Chemical Elements',
    members: ['Oxygen', 'Carbon', 'Helium', 'Iron', 'Gold', 'Silver', 'Copper'],
    traps: ['Water', 'Salt', 'Steel'],
  },
];

const HARD_SETS: CategorySet[] = [
  {
    category: 'Vertebrates',
    members: ['Dog', 'Eagle', 'Salmon', 'Frog', 'Snake'],
    traps: ['Octopus', 'Crab', 'Spider'],
  },
  {
    category: 'Even Numbers',
    members: ['2', '4', '6', '8', '10', '12', '14'],
    traps: ['0', '22', '100'],
    trapHint: 'trick: 0 is technically even',
  },
  {
    category: 'Noble Gases',
    members: ['Helium', 'Neon', 'Argon', 'Krypton', 'Xenon', 'Radon'],
    traps: ['Nitrogen', 'Hydrogen', 'Oxygen'],
  },
  {
    category: 'Shakespeare Plays',
    members: ['Hamlet', 'Macbeth', 'Othello', 'Romeo and Juliet', 'King Lear'],
    traps: ['Faust', 'Medea', 'Antigone'],
  },
  {
    category: 'Palindromes',
    members: ['Racecar', 'Level', 'Civic', 'Radar', 'Madam', 'Noon'],
    traps: ['Rotator', 'Mirror', 'Refer'],
    trapHint: '"Mirror" and "Refer" are NOT palindromes',
  },
];

export function generateCategoryClashPuzzle(difficulty: Difficulty, rng?: () => number): Puzzle {
  const pool =
    difficulty === 'easy'
      ? EASY_SETS
      : difficulty === 'medium'
        ? [...EASY_SETS, ...MEDIUM_SETS]
        : [...MEDIUM_SETS, ...HARD_SETS];

  const set = pool[randomInt(0, pool.length - 1, rng)]!;

  // Pick 3 members + 1 trap → that's the odd-one-out
  const shuffledMembers = shuffle(set.members, rng).slice(0, 3);
  const trap = set.traps[randomInt(0, set.traps.length - 1, rng)]!;

  const allOptions = shuffle([...shuffledMembers, trap], rng);
  const correctIndex = allOptions.indexOf(trap);

  return {
    type: 'category_clash',
    prompt: `Which does NOT belong in: ${set.category}?`,
    options: allOptions,
    correctIndex,
    meta: { category: set.category, trapHint: set.trapHint ?? '' },
  };
}
