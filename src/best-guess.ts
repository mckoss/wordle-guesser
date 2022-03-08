import { readFile } from 'fs/promises';
import { exit } from 'process';
import { analyze, telemetry, rankExpected, rankStat, rankWorst } from './wordle-guess.js';
import { Wordle } from './wordle.js';

import { Request, MultiTrial } from './best-guess-message.js';
import { shuffle } from './shuffle.js';

import { Pool } from './worker-pool.js';

let dict: string[] = JSON.parse(await readFile('data/words.json', 'utf8'));
const solutions = new Set(JSON.parse(await readFile('data/solutions.json', 'utf8')) as string[]);

let multi = 1;
let table: string[] | undefined;

const NUM_PROCS = 8;

async function main(args: string[]) {
  let rankFunction = rankStat;
  let hardMode = false;
  let showTop = false;
  let top = 10;

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
      } else if (name === 'telemetry') {
        telemetry(true);
      } else if (name === 'solutionsOnly') {
        dict = Array.from(solutions);
      } else if (name === 'top') {
        showTop = true;
        if (value !== '') {
          top = parseInt(value);
          if (isNaN(top) || top < 1) {
            help(`Invalid top value: ${value}`);
          }
        }
      } else if (name === 'multi') {
        if (value === '') {
          multi = 2;
        } else {
          multi = parseInt(value);
          if (isNaN(multi) || multi < 1) {
            help(`Invalid multi value: ${value}`);
          }
        }
      } else if (name === 'table') {
        table = value.split(',');
        for (const guess of table) {
          if (guess.length !== 5) {
            help(`Invalid table value - 5-letter word guesses: ${value}`);
          }
        }
      } else {
        help(`Unknown option: ${option}`);
      }
    } else {
      help(`Invalid argument: ${option}`);
    }
  }

  if (multi === 2) {
    await twoWords();
    return;
  }

  if (table !== undefined) {
    outputTable(table);
    return;
  }

  const guesses = analyze(dict, top, solutions, rankFunction, hardMode);
  console.log(`Optimal first guess is '${guesses[0].guess}' with at most ` +
    `${guesses[0].maxSet.size} words remaining`);
  if (showTop) {
    console.log(guesses);
  }
}

// Try all combinations of first two guesses to determine:
// - Smallest maximum word count with the lowest expected word count.
// - List of words remaining.
// Start out using smaller solution dictionary.
async function twoWords() {
  let count = 0;
  let lastPercent: string | undefined;
  let limit = 25;

  shuffle(dict);

  const totalCombinations = (dict.length * (dict.length + 1)) / 2;

  let bestMax: MultiTrial | undefined;

  const pool = new Pool<Request, MultiTrial>(NUM_PROCS, './node/best-guess-worker.js', (trial) => {
    if (trial.max < limit) {
      limit = trial.max;
    }
    if (bestMax === undefined || trial.max < bestMax.max ||
        trial.max === bestMax.max && trial.expected < bestMax.expected) {
      bestMax = trial;
      outputGuesses(` ${count}. New best guess`, bestMax);
    }
    count++;
    const percent = (count / totalCombinations * 100).toFixed(1);
    if (percent !== lastPercent) {
      lastPercent = percent;
      console.log(`${percent}% complete ...`);
    }
  });

  for (let i = 0; i < dict.length; i++) {
    const guesses = [dict[i]];
    for (let j = i + 1; j < dict.length; j++) {
      guesses[1] = dict[j];
      await pool.call({ guesses, limit });
    }
  }

  await pool.complete(true);

  outputGuesses('Best Two', bestMax!);

  // Search for the best following guesses, given the best
  // first two guesses.

  console.log(`Now searching for best following guesses ...`);
  count = 0;

  const guesses = bestMax!.guesses;
  for (let i = 0; i < dict.length; i++) {
    guesses[2] = dict[i];
    await pool.call({ guesses, limit });
  }

  await pool.complete();

  outputGuesses('Best Three', bestMax!);
}

function outputGuesses(title: string, trial: MultiTrial) {
  console.log(`${title}: ${trial.guesses.join(', ')}`);
  console.log(`  Expected: ${trial.expected}`);
  console.log(`  Max: ${trial.max}`);
  console.log(`  Histogram: ${trial.histogram.map((count) => `${count}`).join(' ')}`);
}

function outputTable(guesses: string[]) {
  const table = guessTable(guesses);

  for (const row of table) {
    console.log(`  ${row.pattern}: ${row.words.join(' ')}`);
  }
}

function guessTable(guesses: string[]) : { pattern: string, words: string[] }[] {
  const wordle = new Wordle(dict);
  const words = new Map<string, string[]>();

  for (const word of solutions) {
    wordle.setWordFast(word);
    const key = guesses.map(guess => wordle.makeGuess(guess)).join('-');
    if (!words.has(key)) {
      words.set(key, []);
    }
    words.get(key)!.push(word);
  }

  const patterns = Array.from(words.keys());
  patterns.sort();

  return patterns.map(pattern => { return { pattern, words: words.get(pattern)! } });
}

function help(msg?: string) {
  if (msg) {
    console.error(msg + '\n');
  }

  console.log(`
Evaluate the best first word for a Wordle game.

Usage:
  best-guess [options]

Options:
  --help                Show this help message.
  --hard                In hard mode - only guess words that remain possible.
  --expected            Rank guesses by expected size of partitions.
  --worst               Rank guesses by worst-case size of partitions.
  --telemetry           Sample words during processing.
  --top=N               Show the top N guesses (default 10).
  --multi=N             Optimize for combination of N words (default 2).
  --solutionsOnly       Only consider words from solutions dictionary.
  --table=guess1,guess2 Show the solution table for a multi-guess solution.
`);

  exit(msg === undefined ? 0 : 1);
}

main(process.argv.slice(2));
