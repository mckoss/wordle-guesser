import { assert } from 'chai';
import { suite, suiteSetup, setup, test } from 'mocha';
import { readFile } from 'fs/promises';
import process from 'process';

import { analyze, telemetry } from '../wordle-guess.js';
import { Wordle } from '../wordle.js';

suite("Wordle Guess", () => {
  let dict: string[];
  let solutions: string[];

  suiteSetup(async () => {
    console.log(`Current dir: ${process.cwd()}`);
    dict = JSON.parse(await readFile('data/words.json', 'utf8'));
    solutions = JSON.parse(await readFile('data/solutions.json', 'utf8'));
    telemetry(true);
  });

  test("get best initial guess", () => {
    const guesses = analyze(dict, 10, new Set(solutions));
    console.log(`Optimal first guess is '${guesses[0].guess}' with at most ` +
      `${guesses[0].maxSet.size} words remaining`);
    console.log(guesses);
    assert.equal(guesses[0].guess, 'roate');
    assert.equal(guesses[0].maxSet.size, 195);
  }).timeout(120000);

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
