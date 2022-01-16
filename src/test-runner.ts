import { prompt } from './prompt.js';
import { readFile } from 'fs/promises';
import { exit } from 'process';

import { Wordle, isValidClue } from './wordle.js';
import { analyze } from './wordle-guess.js';

const dict = JSON.parse(await readFile('data/words.json', 'utf8')) as string[];
const tests = JSON.parse(await readFile('data/test-words.json', 'utf8')) as string[];

const wordle = new Wordle(dict);

for (const word of tests) {
  let subset = new Set(dict);

  try {
    wordle.setWord(word);
  } catch(e) {
    console.log([word, 'not-in-dict', '#N/A'].join(','));
    continue;
  }

  let guess = 'tares';
  let guesses = [];
  let guessCount = 0;

  while (true) {
    const clue = wordle.makeGuess(guess);
    guessCount++;
    guesses.push(guess);

    if (clue === '!!!!!') {
      console.log([word, guesses.join('-'), guessCount].join(','));
      break;
    }

    const words = wordle.possibleWords(guess, clue, subset);
    guesses.push(`${words.length}`);

    // console.log(`${word} guess ${guess} => ${clue}(${words.length})`);
    subset = new Set(words);
    const guessStats = analyze(dict, 1, subset);
    guess = guessStats[0].guess;
    guesses.push(`V${guessStats[0].expected.toFixed(1)}`);
  }
}

