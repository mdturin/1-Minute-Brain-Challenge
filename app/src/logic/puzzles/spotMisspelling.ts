import type { Puzzle } from './types';
import type { Difficulty } from '../difficulty';

function randomInt(min: number, max: number, rng?: () => number): number {
  return Math.floor((rng ?? Math.random)() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[], rng?: () => number): T[] {
  return [...arr].sort(() => (rng ?? Math.random)() - 0.5);
}

// Each entry: [correct spelling, common misspelling]
const WORD_PAIRS: [string, string][] = [
  // Easy — obvious misspellings
  ['receive', 'recieve'],
  ['believe', 'beleive'],
  ['friend', 'freind'],
  ['piece', 'peice'],
  ['height', 'hieght'],
  ['ceiling', 'cieling'],
  ['achieve', 'acheive'],
  ['weird', 'wierd'],
  ['foreign', 'foriegn'],
  ['ancient', 'acient'],
  // Medium — trickier
  ['necessary', 'neccessary'],
  ['separate', 'seperate'],
  ['definitely', 'definately'],
  ['occurrence', 'occurence'],
  ['millennium', 'millenium'],
  ['accommodation', 'accomodation'],
  ['embarrass', 'embarass'],
  ['conscience', 'concience'],
  ['privilege', 'privelege'],
  ['rhythm', 'rythm'],
  // Hard — subtle
  ['cemetery', 'cemetary'],
  ['maintenance', 'maintainence'],
  ['liaision', 'liaison'],
  ['supersede', 'supercede'],
  ['inoculate', 'innoculate'],
  ['liaison', 'liason'],
  ['questionnaire', 'questionaire'],
  ['bureaucracy', 'beaurocracy'],
  ['manoeuvre', 'manoeuver'],
  ['conscientious', 'consciencious'],
];

const EASY_WORDS = WORD_PAIRS.slice(0, 10);
const MEDIUM_WORDS = WORD_PAIRS.slice(0, 20);
const HARD_WORDS = WORD_PAIRS;

export function generateSpotMisspellingPuzzle(difficulty: Difficulty, rng?: () => number): Puzzle {
  const pool = difficulty === 'easy' ? EASY_WORDS : difficulty === 'medium' ? MEDIUM_WORDS : HARD_WORDS;

  // Pick 4 entries for the options — one will be the misspelled one
  const shuffledPool = shuffle(pool, rng);
  const selected = shuffledPool.slice(0, 4);
  const misspelledIdx = randomInt(0, 3, rng);

  // Build options: 3 correct spellings + 1 misspelling
  const options = selected.map(([correct, wrong], i) =>
    i === misspelledIdx ? wrong : correct,
  );

  const shuffledOptions = shuffle(
    options.map((word, i) => ({ word, isWrong: i === misspelledIdx })),
    rng,
  );

  const correctIndex = shuffledOptions.findIndex((o) => o.isWrong);

  return {
    type: 'spot_misspelling',
    prompt: 'Which word is spelled INCORRECTLY?',
    options: shuffledOptions.map((o) => o.word),
    correctIndex,
    meta: {},
  };
}
