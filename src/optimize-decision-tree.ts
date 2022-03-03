import { prompt } from './prompt.js';
import { readFile } from 'fs/promises';
import { exit, argv } from 'process';
import { stringify } from 'wide-json';

import { Wordle, isValidClue, Clue } from './wordle.js';
import { analyze } from './wordle-guess.js';
import { StringTree } from './string-tree.js';

const dict = JSON.parse(await readFile('./data/words.json', 'utf8')) as string[];
const soln = new Set(JSON.parse(await readFile('./data/solutions.json', 'utf8')) as string[]);

const wordle = new Wordle(dict);
const firstGuess = 'roate';

interface NodeStats {
  numWords: number;
  maxDepth: number;
  sumDepth: number;
  avgDepth: number;
}

// A node represents a state of the game where the collection of possible
// words is winnowed down by a guess.  Each of the possible clues is
// represented by a child node.
class WordleNode {
  guess: string | undefined;
  children: Map<Clue, WordleNode>;
  words: Set<string>

  constructor(guess: string | undefined, words: Set<string>) {
    this.guess = guess;
    this.children = new Map();
    this.words = words;
  }

  // Expand the node by generating all possible clues and their corresponding
  // guesses.
  expandNode() {
    // Find the best guess for this node if we don't have one already.
    if (this.guess === undefined) {
      const {guess, numSets} = analyze(dict, 1, this.words)[0];
      this.guess = guess;
      if (numSets === 1) {
        return;
      }
    }

    // Generate all possible clues for this node.
    const clues = wordle.allClues(this.guess, this.words);
    for (const [clue, words] of clues) {
      if (clue === '!!!!!') {
        continue;
      }
      const child = new WordleNode(undefined, words);
      this.children.set(clue, child);
      child.expandNode();
    }
  }

  get inSolution(): boolean {
    return this.words.has(this.guess!);
  }

  getNodeStats(): NodeStats {
    let numWords = this.words.size;
    let maxDepth = 1;
    let sumDepth = this.inSolution ? 1 : 0;

    for (const child of this.children.values()) {
      const stats = child.getNodeStats();
      maxDepth = Math.max(maxDepth, stats.maxDepth + 1);
      sumDepth += stats.sumDepth + stats.numWords;
    }
    return {numWords, maxDepth, sumDepth, avgDepth: sumDepth / numWords};
  }
}

const root = new WordleNode(firstGuess, soln);
root.expandNode();
console.log(root.getNodeStats());
