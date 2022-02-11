import { prompt } from './prompt.js';
import { readFile } from 'fs/promises';
import { exit, argv } from 'process';

import { Wordle, isValidClue } from './wordle.js';
import { analyze } from './wordle-guess.js';

const dict = JSON.parse(await readFile('./data/words.json', 'utf8')) as string[];
const soln = JSON.parse(await readFile('./data/solutions.json', 'utf8')) as string[];

let args = argv.slice(2);
let testWordsFilename = 'solutions';

let sample = false;
let sampleSize = 100;
if (args[0] === '--sample') {
  sample = true;
  args = args.slice(1);
  if (/^[0-9]+$/.test(args[0])) {
    sampleSize = parseInt(args[0]);
    args = args.slice(1);
  }
}

if (args[0] !== undefined) {
  testWordsFilename = args[0];
  args = args.slice(1);
}

const tests = JSON.parse(await readFile(`data/${testWordsFilename}.json`, 'utf8')) as string[];

const wordle = new Wordle(dict);

if (sample) {
  while (sampleSize > 0) {
    let i = Math.floor(Math.random() * tests.length);
    testWord(tests[i]);
    sampleSize--;
  }
} else {
  for (const word of tests) {
    testWord(word);
  }
}

function testWord(word: string) {
  try {
    wordle.setWord(word);
  } catch(e) {
    console.log([word, 'not-in-dict', '#N/A'].join(','));
    return;
  }

  let subset = new Set(soln);

  if (!subset.has(word)) {
    console.log([word, 'not-in-solution-set', '#N/A'].join(','));
    return;
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
      `M${guessStats.maxSet.size}-S${guessStats.singletons})`);
  }
}
