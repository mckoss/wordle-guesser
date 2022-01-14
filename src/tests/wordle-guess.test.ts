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
    for (let i = 0; i < guesses.length; i++) {
      const guess = guesses[i];
      assert.equal(guess.maxSet.words!.length, guess.maxSet.size);
      guess.maxSet.words = guess.maxSet.words!.slice(0, 10);
      guess.maxSet.words.push('...');
    }
    console.log(JSON.stringify(guesses, null, 2));
    assert.equal(guesses[0].guess, 'snare');
    assert.equal(guesses[0].maxSet.size, 270);
  }).timeout(120000);
});
