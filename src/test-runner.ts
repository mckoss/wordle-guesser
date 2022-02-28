import { prompt } from './prompt.js';
import { readFile } from 'fs/promises';
import { exit, argv } from 'process';

import { Wordle, isValidClue } from './wordle.js';
import { analyze, rankExpected, rankStat, rankWorst } from './wordle-guess.js';

import { MultiSet } from './multiset.js';

const DEFAULT_GUESS = 'raise';
const DEFAULT_SAMPLE = 20;

async function main(args: string[]) {
  let firstGuess = DEFAULT_GUESS;
  let rankFunction = rankStat;
  let hardMode = false;
  let testWordsFilename = 'solutions';
  let sample = false;
  let sampleSize = DEFAULT_SAMPLE;
  let showStats = false;
  let silent = false;
  const histogram = new MultiSet<number>();

  const dict = JSON.parse(await readFile('./data/words.json', 'utf8')) as string[];
  const soln = JSON.parse(await readFile('./data/solutions.json', 'utf8')) as string[];

  for (const option of args) {
    if (option.startsWith('--')) {
      const [, name, value] = option.match(/^--([^=]+)=?(.*)$/) || [];
      if (name === 'help') {
        help();
      } else if (name === 'expected') {
        rankFunction = rankExpected;
      } else if (name === 'worst') {
        rankFunction = rankWorst;
      } else if (name === 'hard') {
        hardMode = true;
      } else if (name === 'start') {
        firstGuess = value;
      } else if (name === 'stats') {
        showStats = true;
      } else if (name === 'silent') {
        silent = true;
      } else if (name === 'sample') {
        sample = true;
        if (value !== '') {
          sampleSize = parseInt(value);
          if (isNaN(sampleSize) || sampleSize < 1) {
            help(`Invalid sample size: ${value}`);
          }
        }
      } else {
        help(`Unknown option: ${option}`);
      }
    } else {
      testWordsFilename = option;
    }
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

  if (showStats) {
    let expected = 0;
    for (let guess of histogram) {
      expected += guess * histogram.count(guess) / histogram.size;
    }
    console.log(`Total Words: ${histogram.size}\n` +
      `Average guesses: ${expected.toFixed(2)}`);

    let buckets = Array.from(histogram).sort();
    for (let guess of buckets) {
      console.log(`${guess}: ${histogram.count(guess)}`);
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

    let guess = firstGuess;
    let guesses = [];
    let guessCount = 0;

    while (true) {
      const clue = wordle.makeGuess(guess);
      guessCount++;
      guesses.push(guess + (subset.has(guess) ? '!' : ''));

      if (clue === '!!!!!') {
        if (!silent) {
          console.log([word, guesses.join('-'), guessCount].join(','));
        }
        histogram.add(guessCount);
        break;
      }

      const words = wordle.possibleWords(guess, clue, subset);

      // console.log(`${word} guess ${guess} => ${clue}(${words.length})`);
      subset = new Set(words);
      const guessStats = analyze(dict, 1, subset, rankFunction, hardMode)[0];
      guess = guessStats.guess;

      // Embed stats about the current state of knowledge.
      // (universe, expected, max, singletons)
      guesses.push(`(${words.length}-E${guessStats.expected.toFixed(1)}-` +
        `M${guessStats.maxSet.size}-S${guessStats.singletons})`);
    }
  }
}

function help(msg?: string) {
  if (msg) {
    console.error(msg);
  }

  console.log(`
Exhaustive test of all words.

Usage:
  test-runner [options] [test-words-file]

  test-words-file: JSON file containing a list of words to test as array.

Options:
  --help         Show this help message.
  --hard         In hard mode - only guess words that remain possible.
  --expected     Rank guesses by expected size of partitions.
  --worst        Rank guesses by worst-case size of partitions.
  --sample=N     Only use a sample subset of the test words (default ${DEFAULT_SAMPLE}).
  --start=<word> Default first guess is ${{DEFAULT_GUESS}}.
  --silent       Don't print out each guess.
  --stats        Show stats and histogram of guesses.
`);

  exit(msg === undefined ? 0 : 1);
}

main(process.argv.slice(2));
