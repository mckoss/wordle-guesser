import { readFile } from 'fs/promises';
import { exit, argv } from 'process';
import { parentPort } from 'worker_threads';

import { Wordle } from './wordle.js';
import { MultiSet } from './multiset.js';
import { MultiTrial } from './best-guess-message.js';

const dict = JSON.parse(await readFile('./data/words.json', 'utf8')) as string[];
const solutions = new Set(JSON.parse(await readFile('./data/solutions.json', 'utf8')) as string[]);

const wordle = new Wordle(dict);

parentPort!.on("message", (guesses: string[]) => {
  const result = testGuesses(guesses);
  parentPort!.postMessage(result);
});

function testGuesses(guesses: string[]) : MultiTrial {
  const wordle = new Wordle(dict);
  const clues = new MultiSet<string>();

  for (const word of solutions) {
    wordle.setWordFast(word);
    const key = guesses.map(guess => wordle.makeGuess(guess)).join('-');
    clues.add(key);
  }

  return {
    guesses,
    expected: clues.expectedSize(),
    max: clues.count(clues.mostFrequent())
  };
}
