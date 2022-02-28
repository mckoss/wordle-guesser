import { assert } from 'chai';
import { Resolver } from 'dns';
import { suite, suiteSetup, setup, test } from 'mocha';
import { pathToFileURL } from 'url';

import { Pool } from '../worker-pool.js';

suite("Worker Pool", () => {
  test("constructor", (done) => {
    const pool = new Pool<number, number>(4, "./node/tests/doubler-worker.js", sync);

    pool.call(21);

    function sync(message: number) {
      assert(message === 42);
      pool.complete();
      done();
    }
  });
});
