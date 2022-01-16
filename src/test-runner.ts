import { prompt } from './prompt.js';
import { readFile } from 'fs/promises';
import { exit } from 'process';

import { Wordle, isValidClue } from './wordle.js';
import { analyze } from './wordle-guess.js';

const dict = JSON.parse(await readFile('data/words.json', 'utf8')) as string[];
const soln = JSON.parse(await readFile('data/solutions.json', 'utf8')) as string[];
const tests = JSON.parse(await readFile('data/test-words.json', 'utf8')) as string[];

const wordle = new Wordle(dict);

for (const word of tests) {
  let subset = new Set(soln);

  if (!subset.has(word)) {
    console.log([word, 'not-in-solution-set', '#N/A'].join(','));
    continue;
  }

  try {
    wordle.setWord(word);
  } catch(e) {
    console.log([word, 'not-in-dict', '#N/A'].join(','));
    continue;
  }

  let guess = 'raise';
  let guesses = [];
  let guessCount = 0;

  while (true) {
    const clue = wordle.makeGuess(guess);
    guessCount++;
    guesses.push(guess + (subset.has(guess) ? '!' : ''));

    if (clue === '!!!!!') {
      console.log([word, guesses.join('-'), guessCount].join(','));
      break;
    }

    const words = wordle.possibleWords(guess, clue, subset);

    // console.log(`${word} guess ${guess} => ${clue}(${words.length})`);
    subset = new Set(words);
    const guessStats = analyze(dict, 1, subset)[0];
    guess = guessStats.guess;

    // Embed stats about the current state of knowlege.
    // (universe, expected, max, singletons)
    guesses.push(`(${words.length}-E${guessStats.expected.toFixed(1)}-` +
      `M${guessStats.maxSet.size}-I${guessStats.isolates})`);
  }
}

