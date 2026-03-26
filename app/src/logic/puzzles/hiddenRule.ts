import type { Puzzle } from './types';
import type { Difficulty } from '../difficulty';

function randomInt(min: number, max: number, rng?: () => number): number {
  return Math.floor((rng ?? Math.random)() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[], rng?: () => number): T[] {
  return [...arr].sort(() => (rng ?? Math.random)() - 0.5);
}

type Rule = {
  name: string;
  apply: (word: string) => number;
  description: string;
};

const RULES: Rule[] = [
  {
    name: 'letter_count',
    apply: (w) => w.length,
    description: 'Count the letters',
  },
  {
    name: 'vowel_count',
    apply: (w) => [...w].filter((c) => 'aeiouAEIOU'.includes(c)).length,
    description: 'Count the vowels',
  },
  {
    name: 'consonant_count',
    apply: (w) => [...w].filter((c) => /[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/.test(c)).length,
    description: 'Count the consonants',
  },
  {
    name: 'unique_letters',
    apply: (w) => new Set(w.toLowerCase()).size,
    description: 'Count unique letters',
  },
];

const WORD_SETS: string[][] = [
  // Mixed 3–4 letters
  ['CAT', 'CAKE', 'DOG', 'FROG', 'BAT', 'BIRD', 'RAT', 'DRUM', 'MAP', 'FISH'],
  // Mixed 4–5 letters
  ['CAKE', 'APPLE', 'FROG', 'EAGLE', 'MOON', 'DREAM', 'STAR', 'GRAPE', 'WOLF', 'CHESS'],
  // Mixed 5–6 letters
  ['APPLE', 'BRIDGE', 'EAGLE', 'CASTLE', 'DREAM', 'DESERT', 'FLAME', 'FLOWER', 'OCEAN', 'HUNTER'],
  // Mixed 3–5 letters (wide spread)
  ['CAT', 'BIRD', 'APPLE', 'DOG', 'FROG', 'EAGLE', 'MAP', 'DRUM', 'DREAM', 'ICE'],
  // Mixed 4–6 letters
  ['CAKE', 'BRIDGE', 'FROG', 'CASTLE', 'MOON', 'DESERT', 'STAR', 'JUNGLE', 'WOLF', 'ISLAND'],
];

export function generateHiddenRulePuzzle(difficulty: Difficulty, rng?: () => number): Puzzle {
  // Pick a rule — easy: letter_count, medium adds vowel/consonant, hard adds unique_letters
  const availableRules =
    difficulty === 'easy'
      ? [RULES[0]!]
      : difficulty === 'medium'
        ? [RULES[0]!, RULES[1]!, RULES[2]!]
        : RULES;

  const rule = availableRules[randomInt(0, availableRules.length - 1, rng)]!;

  // Pick a word set
  const wordSet = WORD_SETS[randomInt(0, WORD_SETS.length - 1, rng)]!;
  const shuffledWords = shuffle(wordSet, rng);

  // Need 3 example words + 1 mystery word, all with distinct rule-values among examples
  const exampleWords: string[] = [];
  const usedValues = new Set<number>();

  for (const word of shuffledWords) {
    if (exampleWords.length >= 3) break;
    const val = rule.apply(word);
    if (!usedValues.has(val)) {
      exampleWords.push(word);
      usedValues.add(val);
    }
  }

  // Find mystery word — pick one not already used
  const usedWords = new Set(exampleWords);
  const mysteryWord = shuffledWords.find((w) => !usedWords.has(w)) ?? 'STORM';
  const correctAnswer = rule.apply(mysteryWord);

  // Build distractors: nearby values not equal to correct
  const distractors = new Set<number>();
  for (let offset = 1; distractors.size < 3; offset++) {
    if (correctAnswer - offset > 0) distractors.add(correctAnswer - offset);
    if (distractors.size < 3) distractors.add(correctAnswer + offset);
  }

  const allOptions = shuffle([correctAnswer, ...[...distractors].slice(0, 3)], rng);
  const correctIndex = allOptions.indexOf(correctAnswer);

  // Build prompt: "CAT→3, FISH→4, APPLE→5, CLOUD→?"
  const exampleParts = exampleWords.map((w) => `${w}→${rule.apply(w)}`).join(', ');
  const prompt = `${exampleParts}, ${mysteryWord}→?`;

  return {
    type: 'hidden_rule',
    prompt,
    options: allOptions.map(String),
    correctIndex,
    meta: { ruleName: rule.name, mysteryWord },
  };
}
