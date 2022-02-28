import { prompt } from './prompt.js';
import { readFile } from 'fs/promises';
import { exit, argv } from 'process';

import { MultiSet } from './multiset.js';

import { Pool } from './worker-pool.js';

import { Message, Result, RankFunctionName } from './test-runner-message.js';

const DEFAULT_GUESS = 'raise';
const DEFAULT_SAMPLE = 20;

const NUM_PROCS = 10;
const INSET_MARGIN = 0.15;

async function main(args: string[]) {
  let firstGuess = DEFAULT_GUESS;
  let hardMode = false;
  let testWordsFilename = 'solutions';
  let sample = false;
  let sampleSize = DEFAULT_SAMPLE;
  let showStats = false;
  let silent = false;
  const histogram = new MultiSet<number>();
  let rankFunction: RankFunctionName = 'stat';
  let insetMargin = INSET_MARGIN;

  for (const option of args) {
    if (option.startsWith('--')) {
      const [, name, value] = option.match(/^--([^=]+)=?(.*)$/) || [];
      if (name === 'help') {
        help();
      } else if (name === 'expected') {
        rankFunction = name;
      } else if (name === 'worst') {
        rankFunction = name;
      } else if (name === 'hard') {
        hardMode = true;
      } else if (name === 'start') {
        firstGuess = value;
      } else if (name === 'stats') {
        showStats = true;
      } else if (name === 'margin') {
        insetMargin = parseFloat(value);
        if (isNaN(insetMargin)) {
          help(`--stats=${value} is not a number`);
        }
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

  const pool = new Pool<Message, Result>(NUM_PROCS, './node/test-runner-worker.js', (result) => {
    if (!silent) {
      console.log(result.row);
    }
    histogram.add(result.count);
  });

  if (sample) {
    while (sampleSize > 0) {
      let i = Math.floor(Math.random() * tests.length);
      await pool.call({ word: tests[i], firstGuess, rankFunction, insetMargin, hardMode });
      sampleSize--;
    }
  } else {
    for (const word of tests) {
      await pool.call({ word, firstGuess, rankFunction, insetMargin, hardMode });
    }
  }

  await pool.complete();

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
  --margin=N     Set the margin of benefit for in-solution word for default ranking function
                 (default ${INSET_MARGIN}).
`);

  exit(msg === undefined ? 0 : 1);
}

main(process.argv.slice(2));
