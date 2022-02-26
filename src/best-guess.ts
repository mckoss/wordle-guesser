import { analyze, telemetry } from './wordle-guess.js';
import { readFile } from 'fs/promises';

const dict: string[] = JSON.parse(await readFile('data/words.json', 'utf8'));
const solutions: string[] = JSON.parse(await readFile('data/solutions.json', 'utf8'));

telemetry(true);
const guesses = analyze(dict, 10, new Set(solutions));
console.log(`Optimal first guess is '${guesses[0].guess}' with at most ` +
  `${guesses[0].maxSet.size} words remaining`);
console.log(guesses);
