#!/usr/bin/env node
// process-dictionary --- Read in dictionary file and output just 5 letter words to json file.

import { readFile, writeFile } from 'fs/promises';
let dict = (await readFile('data/dict.txt', 'utf-8')).split('\n');

console.log(`${dict.length} words in dictionary`);

dict = dict.map(w => w.toLowerCase().replace(/[^a-z]/g, ''));

const subset = dict.filter(word => word.length === 5);

console.log(`${subset.length} words in 5-character subset`);

await writeFile('public/scripts/dict.json', JSON.stringify(subset));
