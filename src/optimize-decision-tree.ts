import { prompt } from './prompt.js';
import { readFile } from 'fs/promises';
import { exit, argv } from 'process';
import { stringify } from 'wide-json';

import { Wordle, isValidClue, Clue } from './wordle.js';
import { analyze, GuessStats } from './wordle-guess.js';
import { StringTree, TreeNode, ChildNodes } from './string-tree.js';
import { stat } from 'fs';

const dict = JSON.parse(await readFile('./data/words.json', 'utf8')) as string[];
const soln = new Set(JSON.parse(await readFile('./data/solutions.json', 'utf8')) as string[]);

const wordle = new Wordle(dict);
const firstGuess = 'roate';

let silent = false;
let dump = false;

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
    result.push(`Expected partition size: ${this.expectedPartitionSize.toFixed(2)} words`);
    return result.join('\n');
  }

  get expectedPartitionSize(): number {
    return this.numSquaredPartition / this.words;
  }

  // Depth and count at depth
  static maxDepth(stats: LevelStats[]): [number, number] {
    const last = stats.length - 1;
    return [last, stats[last].solves];
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
  children: Map<Clue, WordleNode> | undefined;
  words: Set<string>

  constructor(guess: string | undefined, words: Set<string>) {
    this.guess = guess;
    this.words = words;
  }

  // Expand the node by generating all possible clues and their corresponding
  // guesses.
  // This function tries several alternative of the 2nd level nodes to see
  // if there are alternatives with fewer words at the max depth.
  expandNode(level = 1) {
    // Guess already pre-determined.
    if (this.guess !== undefined) {
      this.children = this.computeChildren(level, this.guess);
      return;
    }

    let guesses: GuessStats[];

    let numOptions = level === 2 ? 50 : 1;

    // Find the best guess for this node.
    guesses = analyze(dict, numOptions, this.words);
    this.guess = guesses[0].guess;

    // This is a terminal node - guess the only possible word.
    if (this.words.size === 1) {
      return;
    }

    this.children = this.computeChildren(level, this.guess);

    // Don't bother optimizing this node.
    if (level !== 2 || this.depth < 4) {
      return;
    }

    const maxDepth = this.depth;
    let count = this.countDepth(maxDepth);

    if (!silent) {
      console.log(`Optimizable node: ${this.guess} has ${count} ${maxDepth+1}-guess words.`);
    }

    // Save the best choice of guess
    let bestGuess = this.guess;
    let bestChildren = this.children;

    for (let i = 1; i < guesses.length; i++) {
      const newGuess = guesses[i]
      this.children = this.computeChildren(level, guesses[i].guess);

      if (this.depth < maxDepth) {
        if (!silent) {
          console.log(`Eliminated ${maxDepth + 1}-guess words using ${guesses[i].guess} ` +
           `instead of ${bestGuess}.`);
        }
        this.guess = guesses[i].guess;
        return;
      }

      const newCount = this.countDepth(maxDepth);

      if (newCount < count) {
        if (!silent) {
          console.log(`Reduced count of ${maxDepth + 1}-guess words from ${count} to ${newCount} ` +
           `using ${guesses[i].guess} instead of ${bestGuess}.`);
        }
        bestGuess = guesses[i].guess;
        bestChildren = this.children;
        count = newCount;
      }
    }

    this.guess = bestGuess;
    this.children = bestChildren;
  }

  computeChildren(level: number, guess: string): Map<Clue, WordleNode> {
    const children = new Map<Clue, WordleNode>();

    const clues = wordle.allClues(guess, this.words);
    for (const [clue, words] of clues) {
      if (clue === '!!!!!') {
        continue;
      }
      const child = new WordleNode(undefined, words);
      children.set(clue, child);
      child.expandNode(level + 1);
    }

    return children;
  }

  get inSolution(): boolean {
    return this.words.has(this.guess!);
  }

  get depth(): number {
    let depth = 1;

    if (this.children === undefined) {
      return depth;
    }

    for (const child of this.children.values()) {
      depth = Math.max(depth, child.depth + 1);
    }

    return depth;
  }

  // Count number of solutions at a specific depth from this node.
  countDepth(depth: number): number {
    if (depth <= 0) {
      return 0;
    }
    if (depth === 1) {
      return this.inSolution ? 1 : 0;
    }

    if (this.children === undefined) {
      return 0;
    }

    let count = 0;

    for (let child of this.children.values()) {
      count += child.countDepth(depth - 1);
    }

    return count;
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

    if (this.children !== undefined) {
      for (const child of this.children.values()) {
        child.getNodeStats(level + 1, stats);
        stats[level].words += child.words.size;
        stats[level].maxPartition = Math.max(stats[level].maxPartition, child.words.size);
        stats[level].countPartition++;
        stats[level].numSquaredPartition += child.words.size ** 2;
      }
    }

    return stats;
  }

  toJSON(): TreeNode {
    if (this.words.size === 1) {
      return this.guess!;
    }

    const result = {} as ChildNodes;
    const node = { [this.guess!]: result };

    for (const [clue, child] of this.children!) {
      result[clue] = child.toJSON();
    }

    return node as TreeNode;
  }
}

async function main(args: string[]) {
  for (const option of args) {
    if (option.startsWith('--')) {
      const [, name, value] = option.match(/^--([^=]+)=?(.*)$/) || [];
      if (name === 'help') {
        help();
      } else if (name === 'silent') {
        silent = true;
      } else if (name === 'dump') {
        dump = true;
      } else {
        help(`Unknown option: ${option}`);
      }
    } else {
      help(`Unknown argument: ${option}`);
    }
  }

  const root = new WordleNode(firstGuess, soln);
  root.expandNode();
  const stats = root.getNodeStats();

  if (!silent) {
    for (let i = 1; i < stats.length; i++) {
      console.log(stats[i].toString(i) + '\n');
    }

    console.log(`First guess: ${root.guess}`);
    console.log(`Expected guesses: ${LevelStats.expectedGuesses(stats).toFixed(2)}`);
    const [level, count] = LevelStats.maxDepth(stats);
    console.log(`Max guesses: ${level} for ${count} words`);

    console.log(`Clues for 2nd guess for ${level}-guess words:`);
    for (const [clue, child] of root.children!.entries()) {
      if (child.depth === level - 1) {
        console.log(`${clue}: ${child.countDepth(4)} using ${child.guess}`);
      }
    }
  }

  console.log(stringify(root.toJSON()));
}

function help(msg?: string) {
  if (msg) {
    console.error(msg);
  }

  console.log(`
Optimize clues to minimize the number of words that require the maximum number of guesses.

Usage:
  test-runner [options] [test-words-file]

  test-words-file: JSON file containing a list of words to test as array.

Options:
  --help         Show this help message.
  --silent       Don't print progress messages or statistics.
  --dump         Print the tree of guesses.
  --mods         Print the 2nd guess mods needed to optimize the default algo.
`);

  exit(msg === undefined ? 0 : 1);
}

main(process.argv.slice(2));
