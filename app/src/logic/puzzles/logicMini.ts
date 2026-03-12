import type { Puzzle } from './types';

type LogicPattern = {
  sequence: number[];
  correct: number;
};

const patterns: LogicPattern[] = [
  { sequence: [2, 4, 6], correct: 8 },
  { sequence: [3, 6, 9], correct: 12 },
  { sequence: [5, 10, 15], correct: 20 },
  { sequence: [1, 1, 2, 3], correct: 5 },
  { sequence: [2, 3, 5, 8], correct: 13 },
];

function pickRandomPattern(): LogicPattern {
  const index = Math.floor(Math.random() * patterns.length);
  return patterns[index];
}

export function generateLogicMiniPuzzle(): Puzzle {
  const pattern = pickRandomPattern();
  const prompt = `Sequence: ${pattern.sequence.join(', ')}, ?`;

  const distractors = new Set<number>();
  while (distractors.size < 3) {
    const delta = Math.floor(Math.random() * 5) + 1;
    const sign = Math.random() > 0.5 ? 1 : -1;
    const candidate = pattern.correct + sign * delta;
    if (candidate !== pattern.correct && candidate > 0) {
      distractors.add(candidate);
    }
  }

  const optionsArray = [...distractors, pattern.correct].sort(() => Math.random() - 0.5);
  const correctIndex = optionsArray.indexOf(pattern.correct);

  return {
    type: 'logic_mini',
    prompt,
    options: optionsArray.map(String),
    correctIndex,
  };
}

