import { assert } from 'chai';
import { suite, suiteSetup, setup, test } from 'mocha';

import { choices, binomial } from '../choices.js';

suite('Choices', () => {
  test('choices(5, 0)', () => {
    const results = Array.from(choices(5, 0));
    assert.deepEqual(results, [[]]);
  });

  test('choices(5, 1)', () => {
    const results = Array.from(choices(5, 1));
    assert.deepEqual(results, [[0],[1], [2], [3], [4]]);
  });

  test('choices(5, 2)', () => {
    const results = Array.from(choices(5, 2));
    assert.deepEqual(results, [[0,1], [0,2], [0,3], [0,4], [1,2], [1,3], [1,4], [2,3], [2,4], [3,4]]);
  });

  test('choices(5, 5)', () => {
    const results = Array.from(choices(5, 5));
    assert.deepEqual(results, [[0,1,2,3,4]]);
  });

  test('binomial(5, 5)', () => {
    assert.equal(binomial(5, 5), 1);
  });

  test('binomial(5, 2)', () => {
    assert.equal(binomial(5, 2), 10);
  });
});
