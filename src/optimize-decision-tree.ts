import { prompt } from './prompt.js';
import { readFile } from 'fs/promises';
import { exit, argv } from 'process';
import { stringify } from 'wide-json';

import { Wordle, isValidClue } from './wordle.js';
import { analyze } from './wordle-guess.js';
import { StringTree } from './string-tree.js';

const dict = JSON.parse(await readFile('./data/words.json', 'utf8')) as string[];
const soln = JSON.parse(await readFile('./data/solutions.json', 'utf8')) as string[];

const wordle = new Wordle(dict);
const firstGuess = 'roate';

interface Node {
  guess: string;
  clue: string;
  children: Node[],
  maxDepth: number;
  averageDepth: number;
  possibleWords: Set<string>
}

const root: Node = {
  possibleWords: new Set(soln),
};

expandNode(root, firstGuess);

function expandNode(node: Node, guess: string) {
  const clues = wordle.possibleClues(guess);
}

for (const word of soln) {
  testWord(word);
}

console.log(decisions.stringify());

function testWord(word: string) {
  try {
    wordle.setWord(word);
  } catch(e) {
    console.error(e);
    exit(1);
  }

  let subset = new Set(soln);

  if (!subset.has(word)) {
    console.error([word, 'not-in-solution-set', '#N/A'].join(','));
    exit(1);
  }

  let guess = firstGuess;

  let ref = startRef;

  while (true) {
    const clue = wordle.makeGuess(guess);

    if (clue === '!!!!!') {
      break;
    }

    const words = wordle.possibleWords(guess, clue, subset);

    subset = new Set(words);
    const guessStats = analyze(dict, 1, subset)[0];
    guess = guessStats.guess;

    ref = ref.ensureChildNode(clue, guess);
  }
}
