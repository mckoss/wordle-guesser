import { assert } from 'chai';
import { suite, suiteSetup, setup, test } from 'mocha';
import { readFileSync } from 'fs';
import process from 'process';

import { getGuess } from '../wordle-guess.js';

suite("Wordle Guess", () => {
  let dict: string[];

  suiteSetup(() => {
    console.log(process.cwd());
    const data = readFileSync('public/scripts/dict.json').toString();
    dict = JSON.parse(data);
  });

  test("getGuess", () => {
    const guess = getGuess(dict);
    console.log(guess);
    assert.equal(guess.minSet.size, 1);
    assert.equal(guess.maxSet.size, 271);
  }).timeout(120000);
});
