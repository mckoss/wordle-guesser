// Read a tree format and convert to a table of
import { readFile } from 'fs/promises';

import { stringify } from 'wide-json';

import { TreeNode, ChildNodes, leafEntries } from './string-tree.js';

async function main() {
  const decisions = JSON.parse(await readFile('data/decision-tree.json', 'utf8')) as TreeNode;
  const results = Array.from(leafEntries(decisions));
  results.sort((a, b) => {
    const aPath = a[0];
    const bPath = b[0];
    const common = Math.min(aPath.length, bPath.length);
    for (let i = 0; i < common; i++) {
      if (aPath[i] < bPath[i]) {
        return 1;
      } else if (aPath[i] > bPath[i]) {
        return -1;
      }
    }
    return aPath.length < bPath.length ? 1 : -1;
  });
  console.log(stringify(results));
}

main();
