import { assert } from 'chai';
import { suite, suiteSetup, setup, test } from 'mocha';
import { readFile } from 'fs/promises';
import process from 'process';

import { analyze } from '../wordle-guess.js';

suite("Wordle Guess", () => {
  let dict: string[];

  suiteSetup(async () => {
    console.log(process.cwd());
    dict = JSON.parse(await readFile('public/scripts/dict.json', 'utf8'));
  });

  test("get best", () => {
    const guesses = analyze(dict, 10);
    console.log(`Optimal first guess is '${guesses[0].guess}' with at most ` +
      `${guesses[0].maxSet.size} words remaining`);
    console.log(guesses);
    assert.equal(guesses[0].guess, 'snare');
    assert.equal(guesses[0].maxSet.size, 270);
  }).timeout(120000);
});
