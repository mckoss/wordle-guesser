import { assert } from 'chai';
import { suite, suiteSetup, setup, test } from 'mocha';
import { readFileSync } from 'fs';
import process from 'process';

import { Wordle } from '../wordle.js';

suite("Wordle", () => {
  let dict: string[];
  let wordle: Wordle;

  suiteSetup(() => {
    console.log(process.cwd());
    const data = readFileSync('public/scripts/words.json').toString();
    dict = JSON.parse(data);
  });

  setup(() => {
    wordle = new Wordle(dict);
  });

  test("constructor", () => {
    assert.isTrue(wordle.dict.length > 0);
    assert.equal(wordle.word.length, 5);
  });

  test("guess clues", () => {
    wordle.setWord('maker');

    const tests = [
      ['music', '!XXXX'],
      ['beach', 'X??XX'],
      ['retro', '??XXX']
    ];
    for (let t of tests) {
      assert.equal(wordle.makeGuess(t[0]), t[1]);
    }
  });

  test("setWord not in dictionary", () => {
    assert.throws(() => wordle.setWord('xxxxx'));
  });

  test("setWord and guess it", () => {
    wordle.setWord('maker');
    const resp = wordle.makeGuess('maker');
    assert.equal(resp, '!!!!!');
  });
});
