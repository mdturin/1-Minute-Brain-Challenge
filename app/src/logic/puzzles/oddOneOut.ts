import type { Puzzle } from './types';
import type { Difficulty } from '../difficulty';

type OddOneOutQuestion = {
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
};

// ─── EASY ─────────────────────────────────────────────────────────────────────
const easyQuestions: OddOneOutQuestion[] = [
  // Fruits vs other
  { prompt: 'Which one is NOT a fruit?', options: ['Apple', 'Banana', 'Carrot', 'Mango'], correctIndex: 2 },
  { prompt: 'Which one is NOT a fruit?', options: ['Potato', 'Grape', 'Peach', 'Lemon'], correctIndex: 0 },
  { prompt: 'Which one is NOT a fruit?', options: ['Cherry', 'Pear', 'Onion', 'Plum'], correctIndex: 2 },
  // Animals vs other
  { prompt: 'Which one is NOT an animal?', options: ['Tiger', 'Daisy', 'Eagle', 'Whale'], correctIndex: 1 },
  { prompt: 'Which one is NOT an animal?', options: ['Lion', 'Shark', 'Rose', 'Frog'], correctIndex: 2 },
  { prompt: 'Which one is NOT a land animal?', options: ['Horse', 'Elephant', 'Dolphin', 'Giraffe'], correctIndex: 2 },
  // Colors vs other
  { prompt: 'Which one is NOT a color?', options: ['Blue', 'Cloud', 'Green', 'Red'], correctIndex: 1 },
  { prompt: 'Which one is NOT a color?', options: ['Purple', 'Yellow', 'Stone', 'Orange'], correctIndex: 2 },
  // Shapes
  { prompt: 'Which one is NOT a shape?', options: ['Circle', 'Square', 'Banana', 'Triangle'], correctIndex: 2 },
  { prompt: 'Which one is NOT a 2D shape?', options: ['Rectangle', 'Oval', 'Cube', 'Hexagon'], correctIndex: 2 },
  // Days / Months
  { prompt: 'Which one is NOT a day of the week?', options: ['Monday', 'April', 'Friday', 'Sunday'], correctIndex: 1 },
  { prompt: 'Which one is NOT a month?', options: ['January', 'Tuesday', 'March', 'August'], correctIndex: 1 },
  // Simple math grouping
  { prompt: 'Which one is NOT even?', options: ['2', '4', '7', '8'], correctIndex: 2 },
  { prompt: 'Which one is NOT odd?', options: ['3', '5', '6', '9'], correctIndex: 2 },
  { prompt: 'Which one is NOT less than 10?', options: ['3', '7', '12', '5'], correctIndex: 2 },
  // Vehicles vs other
  { prompt: 'Which one is NOT a vehicle?', options: ['Car', 'Boat', 'Jacket', 'Train'], correctIndex: 2 },
  { prompt: 'Which one is NOT a vehicle?', options: ['Plane', 'Bus', 'Fridge', 'Bicycle'], correctIndex: 2 },
  // Numbers pattern
  { prompt: 'Which number does NOT belong?\n(All others are multiples of 5)', options: ['10', '15', '13', '20'], correctIndex: 2 },
  { prompt: 'Which number does NOT belong?\n(All others are multiples of 3)', options: ['9', '12', '14', '21'], correctIndex: 2 },
];

// ─── MEDIUM ───────────────────────────────────────────────────────────────────
const mediumQuestions: OddOneOutQuestion[] = [
  // Prime numbers
  { prompt: 'Which is NOT a prime number?', options: ['7', '11', '14', '17'], correctIndex: 2 },
  { prompt: 'Which is NOT a prime number?', options: ['13', '19', '21', '23'], correctIndex: 2 },
  { prompt: 'Which is NOT a prime number?', options: ['31', '37', '39', '41'], correctIndex: 2 },
  // Divisibility
  { prompt: 'Which is NOT divisible by 4?', options: ['16', '20', '22', '28'], correctIndex: 2 },
  { prompt: 'Which is NOT divisible by 6?', options: ['12', '18', '22', '30'], correctIndex: 2 },
  { prompt: 'Which is NOT divisible by 7?', options: ['14', '28', '35', '40'], correctIndex: 3 },
  { prompt: 'Which is NOT divisible by 9?', options: ['27', '36', '40', '45'], correctIndex: 2 },
  // Squares / powers
  { prompt: 'Which is NOT a perfect square?', options: ['9', '16', '20', '25'], correctIndex: 2 },
  { prompt: 'Which is NOT a perfect square?', options: ['36', '49', '55', '64'], correctIndex: 2 },
  { prompt: 'Which is NOT a power of 2?', options: ['4', '8', '12', '16'], correctIndex: 2 },
  { prompt: 'Which is NOT a power of 3?', options: ['9', '27', '36', '81'], correctIndex: 2 },
  // Categories
  { prompt: 'Which one is NOT a planet?', options: ['Mars', 'Venus', 'Pluto', 'Saturn'], correctIndex: 2 },
  { prompt: 'Which one is NOT a continent?', options: ['Africa', 'Europe', 'Egypt', 'Asia'], correctIndex: 2 },
  { prompt: 'Which is NOT a type of triangle?', options: ['Scalene', 'Isosceles', 'Hexagonal', 'Equilateral'], correctIndex: 2 },
  { prompt: 'Which is NOT a programming language?', options: ['Python', 'Java', 'Cobra', 'Ruby'], correctIndex: 2 },
  // Synonyms / meaning
  { prompt: 'Which word does NOT mean "happy"?', options: ['Joyful', 'Elated', 'Gloomy', 'Blissful'], correctIndex: 2 },
  { prompt: 'Which word does NOT mean "big"?', options: ['Large', 'Huge', 'Tiny', 'Vast'], correctIndex: 2 },
  { prompt: 'Which is NOT a synonym for "fast"?', options: ['Swift', 'Rapid', 'Sluggish', 'Speedy'], correctIndex: 2 },
  // Roman numerals
  { prompt: 'Which is NOT a valid Roman numeral?', options: ['IV', 'IX', 'IC', 'XL'], correctIndex: 2 },
];

// ─── HARD ─────────────────────────────────────────────────────────────────────
const hardQuestions: OddOneOutQuestion[] = [
  // Fibonacci
  { prompt: 'Which is NOT a Fibonacci number?', options: ['8', '13', '19', '21'], correctIndex: 2 },
  { prompt: 'Which is NOT a Fibonacci number?', options: ['34', '55', '70', '89'], correctIndex: 2 },
  // Same value, different form
  { prompt: 'Which does NOT equal 36?', options: ['6²', '4×9', '6×7', '3×12'], correctIndex: 2 },
  { prompt: 'Which does NOT equal 24?', options: ['3×8', '4×6', '5×5', '2×12'], correctIndex: 2 },
  { prompt: 'Which does NOT equal 100?', options: ['10²', '4×25', '5×19', '50+50'], correctIndex: 2 },
  { prompt: 'Which does NOT equal 48?', options: ['6×8', '4×12', '7×7', '16×3'], correctIndex: 2 },
  // Divisibility edge cases
  { prompt: 'Which is NOT divisible by both 2 and 3?', options: ['12', '18', '22', '24'], correctIndex: 2 },
  { prompt: 'Which is NOT divisible by both 4 and 6?', options: ['12', '24', '32', '36'], correctIndex: 2 },
  // Math properties
  { prompt: 'Which is NOT a triangular number?', options: ['6', '10', '14', '21'], correctIndex: 2 },
  { prompt: 'Which is NOT a cube number?', options: ['8', '27', '36', '64'], correctIndex: 2 },
  { prompt: 'Which is NOT a factor of 60?', options: ['12', '15', '16', '20'], correctIndex: 2 },
  { prompt: 'Which is NOT a factor of 72?', options: ['8', '9', '11', '12'], correctIndex: 2 },
  // Logic / word tricky
  { prompt: 'Which word does NOT contain a hidden number?', options: ['OFTEN', 'STONE', 'FENCE', 'EIGHT'], correctIndex: 2 },
  // (OFTEN=one, STONE=one, EIGHT=eight — FENCE has none)
  { prompt: 'Which is NOT a palindrome?', options: ['LEVEL', 'RADAR', 'TABLE', 'CIVIC'], correctIndex: 2 },
  { prompt: 'Which is NOT a prime when reversed?', options: ['13→31', '17→71', '23→32', '11→11'], correctIndex: 2 },
  // Equation balance
  { prompt: 'Which equation is NOT correct?', options: ['3²+4²=5²', '5²+12²=13²', '6²+8²=11²', '8²+15²=17²'], correctIndex: 2 },
];

function getPool(difficulty: Difficulty): OddOneOutQuestion[] {
  switch (difficulty) {
    case 'easy':   return easyQuestions;
    case 'medium': return mediumQuestions;
    case 'hard':   return hardQuestions;
    default:       return mediumQuestions;
  }
}

export function generateOddOneOutPuzzle(difficulty: Difficulty, rng?: () => number): Puzzle {
  const pool = getPool(difficulty);
  const q = pool[Math.floor((rng ?? Math.random)() * pool.length)]!;

  // Shuffle options while tracking the correct answer
  const indexed = q.options.map((opt, i) => ({ opt, correct: i === q.correctIndex }));
  indexed.sort(() => (rng ?? Math.random)() - 0.5);
  const correctIndex = indexed.findIndex((x) => x.correct);

  return {
    type: 'odd_one_out',
    prompt: q.prompt,
    options: indexed.map((x) => x.opt),
    correctIndex,
  };
}
