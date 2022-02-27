#!/usr/bin/env node

import { prompt } from './prompt.js';
import { readFile } from 'fs/promises';
import { exit } from 'process';

import { Wordle, isValidClue } from './wordle.js';
import { analyze, rankExpected, rankStat, rankWorst } from './wordle-guess.js';

const DEFAULT_GUESS = 'raise';

async function main(args: string[]) {
  let guess = DEFAULT_GUESS;
  let rankFunction = rankStat;

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
      } else {
        help(`Unknown option: ${option}`);
      }
    } else {
      guess = option;
      if (dict.indexOf(guess) === -1) {
        help(`Invalid guess: ${guess}`);
      }
    }
  }

  const wordle = new Wordle(dict);
  let subset = new Set(soln);

  console.log("Let's play Wordle!\n");
  console.log("When prompted for a clue type a 5-letter string of the form:");
  console.log("X - not in answer (Gray in Wordle)");
  console.log("! - correct letter in correct position (Green in Wordle)");
  console.log("? - correct letter in wrong position (Yellow in Wordle)");

  console.log(`I guess '${guess}.'`);
  let guesses = 1;

  while (true) {
    const clue = (await prompt("Clue")).toUpperCase();
    if (!isValidClue(clue)) {
      console.log("That's not a valid clue.");
      continue;
    }

    if (clue === '!!!!!') {
      console.log(`I win. It took me ${guesses} guesses.`);
      exit(0);
    }

    const words = wordle.possibleWords(guess, clue, subset);
    console.log(`I've narrowed it down to ${words.length} words.`);
    console.log(`One of: ${words.join(', ')}`);

    subset = new Set(words);

    const bestGuess = analyze(dict, 1, subset, rankFunction);
    console.log(JSON.stringify(bestGuess));

    guess = bestGuess[0].guess;
    guesses++;

    console.log(`I going to guess '${guess}', now.`);
    console.log("Because that will narrow it down to no more than " +
      `${bestGuess[0].maxSet.size} words in the worst case.`);
  }
}

function help(msg?: string) {
  if (msg) {
    console.error(msg + '\n');
  }

  console.log(`
Program that plays Wordle.

Usage:
  play [options] [start-guess]

  Unless otherwise specified, the program will start with the guess "${DEFAULT_GUESS}".

Options:
  --help       Show this help message.
  --expected   Rank guesses by expected size of partitions.
  --worst      Rank guesses by worst-case size of partitions.
`);

  exit(msg === undefined ? 0 : 1);
}

main(process.argv.slice(2));
