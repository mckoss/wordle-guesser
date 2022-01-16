import { assert } from 'chai';
import { suite, suiteSetup, setup, test } from 'mocha';
import { readFile } from 'fs/promises';
import process from 'process';

import { analyze } from '../wordle-guess.js';
import { Wordle } from '../wordle.js';

suite("Wordle Guess", () => {
  let dict: string[];

  suiteSetup(async () => {
    console.log(process.cwd());
    dict = JSON.parse(await readFile('public/scripts/words.json', 'utf8'));
  });

  test("get best", () => {
    const guesses = analyze(dict, 10);
    console.log(`Optimal first guess is '${guesses[0].guess}' with at most ` +
      `${guesses[0].maxSet.size} words remaining`);
    console.log(guesses);
    assert.equal(guesses[0].guess, 'tares');
    assert.equal(guesses[0].maxSet.size, 337);
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
