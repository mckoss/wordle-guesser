import { readFile } from 'fs/promises';
import { exit } from 'process';
import { analyze, telemetry, rankExpected, rankStat, rankWorst } from './wordle-guess.js';
import { Wordle } from './wordle.js';

import { Request, MultiTrial } from './best-guess-message.js';
import { shuffle } from './shuffle.js';
import { choices, binomial } from './choices.js';

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
          multi = 3;
        } else {
          multi = parseInt(value);
          // Hard coding 3 for now.
          if (isNaN(multi) || multi < 2) {
            help(`Invalid multi value: ${value}`);
          }
        }
      } else if (name === 'table') {
        table = value.split(',');
        for (const guess of table) {
          if (guess.length !== 5) {
            help(`Invalid table value - 5-letter word guesses: ${guess}`);
          }
        }
      } else {
        help(`Unknown option: ${option}`);
      }
    } else {
      help(`Invalid argument: ${option}`);
    }
  }

  if (multi > 1) {
    await multiWordSearch();
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

async function multiWordSearch() {
  let count = 0;
  let limit = multi === 2 ? 200 : 25;
  let nextCount = 0;

  shuffle(dict);

  const totalCombinations = binomial(dict.length, multi);

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
    const percent = (count / totalCombinations * 100).toFixed(4);
    if (count >= nextCount) {
      nextCount = count + 100000;
      console.log(`${percent}% complete ...`);
    }
  });

  for (let indices of choices(dict.length, multi)) {
    const guesses = indices.map(i => dict[i]);
      await pool.call({ guesses, limit });
  }

  await pool.complete(true);

  outputGuesses('Best Three', bestMax!);
}

function outputGuesses(title: string, trial: MultiTrial) {
  console.log(`${title}: ${trial.guesses.join(', ')}`);
  console.log(`  Expected: ${trial.expected}`);
  console.log(`  Max: ${trial.max}`);
  console.log(`  Histogram: ${countsToString(trial.histogram)}`);
}

function countsToString(counts: number[]) {
  const result:string[] = [];
  for (let i = 0; i < counts.length; i++) {
    if (counts[i] !== 0) {
      result.push(`${i}:${counts[i]}`);
    }
  }
  return result.join(' ');
}

type TableRow = { pattern: string, words: string[] };

// Generate a table with the first two guess words, with only the
// patterns that have no more than two solution words.
//
//
async function outputTable(guesses: string[]) {
  let table = guessTable(guesses.slice(0, 2), solutions, 2);

  // Isolate words that have more than two solutions words.
  const multiWordSolutions = new Set(solutions);
  for (const row of table) {
    for (const word of row.words) {
      multiWordSolutions.delete(word);
    }
  }

  console.log(`Two-guess solutions: ${guesses.slice(0, 2).join(', ')} ` +
    `(${solutions.size - multiWordSolutions.size} words)`);
  printTable(table);

  table = guessTable(guesses, multiWordSolutions);

  console.log(`\nThree-guess solutions: ${guesses.join(', ')} ${multiWordSolutions.size} words`);
  printTable(table);

  const pool = new Pool<Request, MultiTrial>(NUM_PROCS, './node/best-guess-worker.js', (trial) => {
    outputGuesses('Distribution', trial);
  });

  pool.call({ guesses, limit: 2000 });
  await pool.complete();

  function printTable(table: TableRow[]) {
    for (const row of table) {
      console.log(`  ${row.pattern}: ${row.words.join(' ')}`);
    }
  }
}

function guessTable(guesses: string[], solutions: Set<string>, wordLimit = 2000) : TableRow[] {
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

  let patterns = Array.from(words.keys());
  patterns = patterns.filter(pattern => words.get(pattern)!.length <= wordLimit);
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
  --multi=N             Optimize for combination of N words (default 3).
  --solutionsOnly       Only consider words from solutions dictionary.
  --table=guess1,guess2 Show the solution table for a multi-guess solution.
`);

  exit(msg === undefined ? 0 : 1);
}

main(process.argv.slice(2));
