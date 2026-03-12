import type { Puzzle } from './types';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateMemorySequencePuzzle(): Puzzle {
  const length = randomInt(3, 5);
  const sequence: number[] = [];
  for (let i = 0; i < length; i += 1) {
    sequence.push(randomInt(1, 9));
  }

  const targetIndex = randomInt(0, length - 1);
  const correctValue = sequence[targetIndex];

  const prompt = `Sequence: ${sequence.join('  ')}\n\nWhich number was in position ${targetIndex + 1}?`;

  const options = new Set<number>();
  options.add(correctValue);
  while (options.size < 4) {
    const candidate = randomInt(1, 9);
    options.add(candidate);
  }

  const optionsArray = Array.from(options).sort(() => Math.random() - 0.5);
  const correctIndex = optionsArray.indexOf(correctValue);

  return {
    type: 'memory_sequence',
    prompt,
    options: optionsArray.map(String),
    correctIndex,
    meta: { sequence, targetIndex },
  };
}

