import { assert } from 'chai';
import { suite, suiteSetup, setup, test } from 'mocha';
import { toNamespacedPath } from 'path/posix';

import { MultiSet } from '../multiset.js';

suite('MultiSet', () => {
  test('constructor', () => {
    const m = new MultiSet<number>();
    assert.isDefined(m);
  });

  test('stats', () => {
    type TestCase<T> = [T[],
      { size: number,
        unique: number,
        most: T,
        mostCount: number,
        expected: number,
        isolates: number,
      }
      ];

    const testCases: TestCase<number>[] = [
      [[1], {size: 1, unique: 1, most: 1, mostCount: 1, expected: 1, isolates: 1}],
      [[1, 1, 1], {size: 3, unique: 1, most: 1, mostCount: 3, expected: 3, isolates: 0}],
      [[1, 1, 1, 2, 2, 3], {size: 6, unique: 3, most: 1, mostCount: 3, expected: 2.333, isolates: 1}],
    ];

    for (const t of testCases) {
      const m = new MultiSet<number>();
      for (const elt of t[0]) {
        m.add(elt);
      }
      const eMost = m.mostFrequent();

      assert.equal(m.size, t[1].size);
      assert.equal(m.unique, t[1].unique);
      assert.equal(eMost, t[1].most);
      assert.equal(m.count(eMost), t[1].mostCount);
      assert.approximately(m.expectedSize(), t[1].expected, 0.001);
      assert.equal(m.countOfSize(1), t[1].isolates);
    }
  });
});
