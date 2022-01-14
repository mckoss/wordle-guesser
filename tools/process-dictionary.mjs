#!/usr/bin/env node
// process-dictionary --- Read in dictionary file and output just 5 letter words to json file.

import { readFile, writeFile } from 'fs/promises';
let dict = (await readFile('data/english3.txt', 'utf-8')).split('\n');

console.log(`${dict.length} words in dictionary`);

dict = dict.filter(word => word.length === 5);
dict = dict.map(w => w.toLowerCase());
dict = dict.filter(word => /^[a-z]+$/.test(word));

console.log(`${dict.length} words in 5-character subset`);

await writeFile('public/scripts/dict.json', JSON.stringify(dict));
