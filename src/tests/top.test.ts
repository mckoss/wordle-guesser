import { assert } from 'chai';
import { suite, suiteSetup, setup, test } from 'mocha';

import { Top } from '../top.js';

suite('Top', () => {
  test('constructor', () => {
    const top = new Top<number>(10, (a, b) => a < b);
    assert.equal(top.top, 10);
    assert.equal(top.results.length, 0);
  });

  test('add', () => {
    const top = new Top<number>(10, (a, b) => a < b);
    for (let i = 20; i >=0; i--) {
      top.add(i);
    }
    assert.deepEqual(top.getResults(), [0,1,2,3,4,5,6,7,8,9]);
  });

  test('add text', () => {
    const top = new Top<string>(3, (a, b) => a < b);
    for (const word of ['every', 'good', 'boy', 'does', 'fine']) {
      top.add(word);
    }
    assert.deepEqual(top.getResults(), ['boy', 'does', 'every']);
  });

});
