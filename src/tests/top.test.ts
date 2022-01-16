import { assert } from 'chai';
import { suite, suiteSetup, setup, test } from 'mocha';
import { toNamespacedPath } from 'path/posix';

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

  test('find lowest', () => {
    for (let i = 0; i < 100; i++) {
      let a = natural(1000);
      shuffle(a);

      let t = new Top<number>(1, (a, b) => a < b);
      for (let j = 0; j < a.length; j++) {
        t.add(a[j]);
      }
      assert.equal(t.getResults()[0], 0);
    }
  });

});

function shuffle<T>(arr: T[]) {
  for (let i = 0; i < arr.length; i++) {
    const j = Math.floor(Math.random() * arr.length);
    // Swap ith and jth elements.
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function natural(n: number): number[] {
  return Array.from({length: n}).map((_, i) => i);
}
