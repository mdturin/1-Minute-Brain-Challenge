import type { Puzzle } from './types';
import type { Difficulty } from '../difficulty';

type WordEntry = { word: string; group: string[] };

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function scramble(word: string): string {
  const letters = word.split('');
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j]!, letters[i]!];
  }
  const result = letters.join('');
  // If accidentally same as original, swap first two chars
  return result === word && word.length > 1
    ? word[1] + word[0] + word.slice(2)
    : result;
}

// ─── WORD BANKS ──────────────────────────────────────────────────────────────

// Easy: 4–5 letter words, grouped so distractors are same-category
const easyWords: WordEntry[] = [
  // Fruits
  { word: 'APPLE', group: ['GRAPE', 'LEMON', 'PEACH'] },
  { word: 'GRAPE', group: ['APPLE', 'LEMON', 'PEACH'] },
  { word: 'LEMON', group: ['APPLE', 'GRAPE', 'PEACH'] },
  { word: 'PEACH', group: ['APPLE', 'GRAPE', 'MANGO'] },
  { word: 'MANGO', group: ['APPLE', 'GRAPE', 'PEACH'] },
  { word: 'PLUM',  group: ['PEAR', 'LIME', 'KIWI'] },
  { word: 'PEAR',  group: ['PLUM', 'LIME', 'KIWI'] },
  { word: 'LIME',  group: ['PLUM', 'PEAR', 'KIWI'] },
  // Animals
  { word: 'BEAR',  group: ['WOLF', 'DEER', 'DUCK'] },
  { word: 'WOLF',  group: ['BEAR', 'DEER', 'DUCK'] },
  { word: 'DEER',  group: ['BEAR', 'WOLF', 'DUCK'] },
  { word: 'DUCK',  group: ['BEAR', 'WOLF', 'DEER'] },
  { word: 'FROG',  group: ['CRAB', 'SLUG', 'MOTH'] },
  { word: 'CRAB',  group: ['FROG', 'SLUG', 'MOTH'] },
  // Colors
  { word: 'BLUE',  group: ['PINK', 'GOLD', 'TEAL'] },
  { word: 'PINK',  group: ['BLUE', 'GOLD', 'TEAL'] },
  { word: 'GOLD',  group: ['BLUE', 'PINK', 'TEAL'] },
  { word: 'TEAL',  group: ['BLUE', 'PINK', 'GOLD'] },
  // Body parts
  { word: 'HAND',  group: ['FOOT', 'KNEE', 'SHIN'] },
  { word: 'FOOT',  group: ['HAND', 'KNEE', 'SHIN'] },
  { word: 'KNEE',  group: ['HAND', 'FOOT', 'CHIN'] },
];

// Medium: 5–6 letter words
const mediumWords: WordEntry[] = [
  // Objects
  { word: 'CHAIR',  group: ['TABLE', 'SHELF', 'BENCH'] },
  { word: 'TABLE',  group: ['CHAIR', 'SHELF', 'BENCH'] },
  { word: 'SHELF',  group: ['CHAIR', 'TABLE', 'BENCH'] },
  { word: 'CLOCK',  group: ['PHONE', 'RADIO', 'LIGHT'] },
  { word: 'PHONE',  group: ['CLOCK', 'RADIO', 'LIGHT'] },
  { word: 'BRUSH',  group: ['COMB', 'RAZOR', 'TOWEL'] },
  // Nature
  { word: 'RIVER',  group: ['OCEAN', 'BEACH', 'SWAMP'] },
  { word: 'OCEAN',  group: ['RIVER', 'BEACH', 'SWAMP'] },
  { word: 'BEACH',  group: ['RIVER', 'OCEAN', 'SWAMP'] },
  { word: 'CLOUD',  group: ['STORM', 'FROST', 'FLAME'] },
  { word: 'STORM',  group: ['CLOUD', 'FROST', 'FLAME'] },
  { word: 'FROST',  group: ['CLOUD', 'STORM', 'FLAME'] },
  // Food
  { word: 'BREAD',  group: ['TOAST', 'PASTA', 'SAUCE'] },
  { word: 'TOAST',  group: ['BREAD', 'PASTA', 'SAUCE'] },
  { word: 'PASTA',  group: ['BREAD', 'TOAST', 'PIZZA'] },
  { word: 'PIZZA',  group: ['BREAD', 'TOAST', 'PASTA'] },
  { word: 'SUGAR',  group: ['CREAM', 'HONEY', 'SYRUP'] },
  { word: 'CREAM',  group: ['SUGAR', 'HONEY', 'SYRUP'] },
  // Sports
  { word: 'RUGBY',  group: ['TENNIS', 'SOCCER', 'POLO'] },
  { word: 'SQUASH', group: ['TENNIS', 'HOCKEY', 'POLO'] },
];

// Hard: 7–8 letter words
const hardWords: WordEntry[] = [
  // Actions
  { word: 'JOURNEY',  group: ['EXPLORE', 'WANDER', 'TRAVEL'] },
  { word: 'EXPLORE',  group: ['JOURNEY', 'WANDER', 'TRAVEL'] },
  { word: 'CAPTURE',  group: ['RELEASE', 'CONTAIN', 'SECURE'] },
  { word: 'WHISPER',  group: ['SHOUT', 'MURMUR', 'MUMBLE'] },
  { word: 'BALANCE',  group: ['STUMBLE', 'TOPPLE', 'STEADY'] },
  { word: 'SCRATCH',  group: ['POLISH', 'SCRUB', 'GRAZE'] },
  // Adjectives
  { word: 'ANCIENT',  group: ['MODERN', 'ARCHAIC', 'PRIMAL'] },
  { word: 'ELEGANT',  group: ['CLUMSY', 'REFINED', 'POISED'] },
  { word: 'BIZARRE',  group: ['NORMAL', 'STRANGE', 'ABSURD'] },
  { word: 'VIBRANT',  group: ['DULL', 'BRIGHT', 'VIVID'] },
  { word: 'BRITTLE',  group: ['STURDY', 'FRAGILE', 'TENDER'] },
  { word: 'CUNNING',  group: ['HONEST', 'CRAFTY', 'SHREWD'] },
  // Nature/Science
  { word: 'CRYSTAL',  group: ['DIAMOND', 'MINERAL', 'PEBBLE'] },
  { word: 'THUNDER',  group: ['TYPHOON', 'BLIZZARD', 'TORNADO'] },
  { word: 'ECLIPSE',  group: ['SUNRISE', 'TRANSIT', 'SOLSTICE'] },
  { word: 'CURRENT',  group: ['VOLTAGE', 'CIRCUIT', 'WATTAGE'] },
  // Places
  { word: 'LIBRARY',  group: ['THEATER', 'STADIUM', 'MUSEUM'] },
  { word: 'STADIUM',  group: ['LIBRARY', 'THEATER', 'MUSEUM'] },
  { word: 'VILLAGE',  group: ['SUBURB', 'HAMLET', 'TOWNSHIP'] },
  { word: 'KITCHEN',  group: ['BEDROOM', 'HALLWAY', 'BALCONY'] },
];

function getWordBank(difficulty: Difficulty): WordEntry[] {
  switch (difficulty) {
    case 'easy':   return easyWords;
    case 'medium': return mediumWords;
    case 'hard':   return hardWords;
    default:       return mediumWords;
  }
}

export function generateWordScramblePuzzle(difficulty: Difficulty): Puzzle {
  const bank = getWordBank(difficulty);
  const entry = randomChoice(bank);
  const scrambled = scramble(entry.word);

  const prompt = `Unscramble this word:\n\n${scrambled}`;

  // Pick 3 distractors from the group, shuffle all 4
  const distractors = [...entry.group].sort(() => Math.random() - 0.5).slice(0, 3);
  const optionsArr = [...distractors, entry.word].sort(() => Math.random() - 0.5);
  const correctIndex = optionsArr.indexOf(entry.word);

  return {
    type: 'word_scramble',
    prompt,
    options: optionsArr,
    correctIndex,
  };
}
