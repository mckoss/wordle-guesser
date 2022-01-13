#!/usr/bin/env node
// process-dictionary --- Read in dictionary file and output just 5 letter words to json file.

const fs = require('fs');
const dict = fs.readFileSync('data/dict.txt', 'utf-8').split('\n');
console.log(`${dict.length} words in dictionary`);

const subset = dict.filter(word => word.length === 5);
console.log(`${subset.length} words in 5-character subset`);

fs.writeFileSync('public/scripts/dict.json', JSON.stringify(subset));
