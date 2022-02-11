import { assert } from 'chai';
import { suite, suiteSetup, setup, test } from 'mocha';

import { StringTree } from '../string-tree.js';

suite('String Tree', () => {
  test('constructor', () => {
    const tree = new StringTree('a');
    assert.equal(tree.stringify(), '"a"');
  });

  test('ensure child node', () => {
    const tree = new StringTree('a');
    const ref = tree.getStartRef();
    ref.ensureChildNode('b', 'c');
    assert.equal(tree.stringify(), '{ "a": { "b": "c" } }');
  });

  test('ensure 2 child nodes', () => {
    const tree = new StringTree('a');
    const ref = tree.getStartRef();
    const childRef = ref.ensureChildNode('b', 'c');
    childRef.ensureChildNode('d', 'e');
    assert.equal(tree.stringify(), '{ "a": { "b": { "c": { "d": "e" } } } }');
  });

  test('ensure sibling nodes', () => {
    const tree = new StringTree('a');
    const ref = tree.getStartRef();
    const childRef = ref.ensureChildNode('b', 'c');
    ref.ensureChildNode('d', 'e');
    assert.equal(tree.stringify(), '{ "a": { "b": "c", "d": "e" } }');
  });
});
