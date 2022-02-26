import { assert } from 'chai';
import { suite, suiteSetup, setup, test } from 'mocha';
import { readFile } from 'fs/promises';
import process from 'process';

import { analyze } from '../wordle-guess.js';
import { Wordle } from '../wordle.js';

suite("Wordle Guess", () => {
  let dict: string[];
  let solutions: string[];

  suiteSetup(async () => {
    console.log(`Current dir: ${process.cwd()}`);
    dict = JSON.parse(await readFile('data/words.json', 'utf8'));
    solutions = JSON.parse(await readFile('data/solutions.json', 'utf8'));
  });

  test("possibleWords", () => {
    const wordle = new Wordle(dict);

    const subset = new Set<string>(['abbey', 'alley', 'babel', 'fahey', 'haaek',
      'hamey', 'hayek', 'hazel', 'label', 'lapel', 'paleo', 'zabel']);
    const guess = 'nobly';
    const clue = 'xx!x!';

    const words = wordle.possibleWords(guess, clue, subset);
    console.log(words);
    assert.equal(words.length, 1);
    assert.equal(words[0], 'abbey');
  });
});
