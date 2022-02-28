import { readFile } from 'fs/promises';
import { exit, argv } from 'process';
import { parentPort } from 'worker_threads';

import { Wordle } from './wordle.js';
import { analyze, rankExpected, rankStat, rankWorst, RankFunction } from './wordle-guess.js';

import { Message } from './test-runner-message.js';

import { MultiSet } from './multiset.js';

const rankFunctions: Map<string, RankFunction> =
  new Map([['expected', rankExpected], ['worst', rankWorst], ['stat', rankStat]]);

async function init() {
  let rankFunction = rankStat;

  const dict = JSON.parse(await readFile('./data/words.json', 'utf8')) as string[];
  const soln = JSON.parse(await readFile('./data/solutions.json', 'utf8')) as string[];

  const wordle = new Wordle(dict);

  parentPort!.on("message", (message: Message) => {
    testWord(message.word,
      message.firstGuess,
      rankFunctions.get(message.rankFunction)!,
      message.hardMode);
  });

  function output(row: string, count: number) {
    parentPort!.postMessage({ row, count });
  }

  function testWord(word: string, firstGuess: string, rankFunction: RankFunction, hardMode = false) {
    try {
      wordle.setWord(word);
    } catch(e) {
      output([word, 'not-in-dict', '#N/A'].join(','), 0);
      return;
    }

    let subset = new Set(soln);

    if (!subset.has(word)) {
      output([word, 'not-in-solution-set', '#N/A'].join(','), 0);
      return;
    }

    let guess = firstGuess;
    let guesses: string[] = [];
    let guessCount = 0;

    while (true) {
      const clue = wordle.makeGuess(guess);
      guessCount++;
      guesses.push(guess + (subset.has(guess) ? '!' : ''));

      if (clue === '!!!!!') {
        output([word, guesses.join('-'), guessCount].join(','), guessCount);
        return;
      }

      const words = wordle.possibleWords(guess, clue, subset);

      subset = new Set(words);
      const guessStats = analyze(dict, 1, subset, rankFunction, hardMode)[0];
      guess = guessStats.guess;

      // Embed stats about the current state of knowledge.
      // (universe, expected, max, singletons)
      guesses.push(`(${words.length}-E${guessStats.expected.toFixed(1)}-` +
        `M${guessStats.maxSet.size}-S${guessStats.singletons})`);
    }
  }
}

init();
