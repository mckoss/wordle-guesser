import { readFile } from 'fs/promises';
import { exit, argv } from 'process';
import { parentPort } from 'worker_threads';

import { Wordle } from './wordle.js';
import { MultiSet } from './multiset.js';
import { Request, MultiTrial } from './best-guess-message.js';

const dict = JSON.parse(await readFile('./data/words.json', 'utf8')) as string[];
const solutions = new Set(JSON.parse(await readFile('./data/solutions.json', 'utf8')) as string[]);

const wordle = new Wordle(dict);

parentPort!.on("message", (req: Request) => {
  const result = testGuesses(req.guesses, req.limit);
  parentPort!.postMessage(result);
});

function testGuesses(guesses: string[], limit: number) : MultiTrial {
  const wordle = new Wordle(dict);
  const clues = new MultiSet<string>();

  for (const word of solutions) {
    wordle.setWordFast(word);
    const key = guesses.map(guess => wordle.makeGuess(guess)).join('-');
    clues.add(key);
    if (clues.count(key) > limit) {
      return { guesses, expected: 0, histogram: [], max: limit + 1 };
    }
  }

  return {
    guesses,
    expected: clues.expectedSize(),
    max: clues.count(clues.mostFrequent()),
    histogram: clues.histogram(),
  };
}
