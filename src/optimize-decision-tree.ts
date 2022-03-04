import { prompt } from './prompt.js';
import { readFile } from 'fs/promises';
import { exit, argv } from 'process';
import { stringify } from 'wide-json';

import { Wordle, isValidClue, Clue } from './wordle.js';
import { analyze } from './wordle-guess.js';
import { StringTree } from './string-tree.js';
import { stat } from 'fs';

const dict = JSON.parse(await readFile('./data/words.json', 'utf8')) as string[];
const soln = new Set(JSON.parse(await readFile('./data/solutions.json', 'utf8')) as string[]);

const wordle = new Wordle(dict);
const firstGuess = 'roate';

// Stats for the guesses and partitions of remaining words
// at a given level of the decision tree.
class LevelStats {
  // The number of words that are guessed correctly.
  solves = 0;

  // The number of words that remain unsolved at this level.
  words = 0;

  // The size of the largest partition of words after this level.
  maxPartition = 0;

  // The total number of partitions of remaining words after this level.
  countPartition = 0;

  // Used to calculate the expected size of all partitions after Level guesses.
  // Expected size = sum(n^2) / words where n is the number of words in each
  // partition.
  numSquaredPartition = 0;

  toString(level: number) {
    let result: string[] = [];
    result.push(`Level ${level}:`);
    result.push(`Solves: ${this.solves}`);
    result.push(`Remaining words: ${this.words}`);
    result.push(`Number of partitions: ${this.countPartition}`);
    result.push(`Largest partition size: ${this.maxPartition} words`);
    result.push(`Expected partition size: ${this.expectedPartitionSize().toFixed(2)} words`);
    return result.join('\n');
  }

  expectedPartitionSize(): number {
    return this.numSquaredPartition / this.words;
  }

  static expectedGuesses(stats: LevelStats[]): number {
    let words = 0;
    let sum = 0;

    for (let level = 1; level < stats.length; level++) {
      words += stats[level].solves;
      sum += level * stats[level].solves;
    }
    return sum / words;
  }
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

  getNodeStats(level = 1, stats?: LevelStats[]) : LevelStats[] {
    if (!stats) {
      stats = [];
    }

    if (stats[level] === undefined) {
      stats[level] = new LevelStats();
    }

    if (this.inSolution) {
      stats[level].solves++;
    }

    for (const child of this.children.values()) {
      child.getNodeStats(level + 1, stats);
      stats[level].words += child.words.size;
      stats[level].maxPartition = Math.max(stats[level].maxPartition, child.words.size);
      stats[level].countPartition++;
      stats[level].numSquaredPartition += child.words.size ** 2;
    }

    return stats;
  }
}

const root = new WordleNode(firstGuess, soln);
root.expandNode();
const stats = root.getNodeStats();

for (let i = 1; i < stats.length; i++) {
  console.log(stats[i].toString(i) + '\n');
}

console.log(`Expected guesses: ${LevelStats.expectedGuesses(stats).toFixed(2)}`);
