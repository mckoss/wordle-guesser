import { Clue, Wordle } from './wordle.js';
import { MultiSet } from './multiset.js';
import { Top } from './top.js';
import { stat } from 'fs';

export { analyze, telemetry, rankExpected, rankStat, rankWorst };

interface SetRep {
  clue: Clue;
  size: number;
  words?: string[];
}

interface GuessStats {
  guess: string;      // The recommended guessed word.
  inSubset: boolean;  // Is the guessed word in the possible solution set.
  numSets: number;    // Number of partitions of remaining words.
  expected: number;   // Expected size of a randomly guessed word's partition.
  singletons: number;   // Number of single-element paritions.
  maxSet: SetRep;
}

let showTelemetry = false;

function telemetry(show: boolean) {
  showTelemetry = show;
}

type RankFunction = (a: GuessStats, b: GuessStats) => boolean;

// A PURE ranking based on expected size of partitions.
function rankExpected(a: GuessStats, b: GuessStats): boolean {
  return a.expected < b.expected;
}

// Return true if a "is better" than b.
function rankStat(a: GuessStats, b: GuessStats): boolean {
  if (a.inSubset === b.inSubset) {
    return a.expected < b.expected;
  }

  if (a.inSubset) {
    return a.expected < b.expected + 0.5;
  } else {
    return a.expected + 0.5 < b.expected;
  }
}

// Smallest worst-case size of a partition ranking is best.
function rankWorst(a: GuessStats, b: GuessStats): boolean {
  if (a.maxSet.size === b.maxSet.size) {
    return a.expected < b.expected;
  }

  return a.maxSet.size < b.maxSet.size;
}

// Return the top guesses and stats for the possible words.
function analyze(dict: string[], top=10, subset?: Set<string>,
  rankFunction: RankFunction = rankStat,
  hardMode = false): GuessStats[] {
  if (!subset) {
    subset = new Set(dict);
  }

  if (subset.size === 0) {
    throw new Error("I don't have any possible words in my dictionary!");
  }

  // The word is determined already.
  if (subset.size === 1) {
    const guess = Array.from(subset)[0];
    return [{
      guess,
      inSubset: true,
      numSets: 1,
      expected: 1,
      singletons: 1,
      maxSet: {
        clue: '!!!!!',
        size: 1,
        words: [guess]
      }
    }];
  }

  const wordle = new Wordle(dict);
  const topGuesses = new Top<GuessStats>(top, rankFunction);

  let choices: string[];
  if (hardMode) {
    choices = Array.from(subset.values());
  } else {
    choices = dict;
  }

  for (let guess of choices) {
    const clueSets = new MultiSet<Clue>();

    // Count up how many possible (remaining) words correspond with each
    // possible clue.
    for (let hidden of subset) {
      wordle.setWordFast(hidden);
      const clue = wordle.makeGuess(guess);
      clueSets.add(clue);
    }

    const clue = clueSets.mostFrequent();

    // Impossible guess - no set has words in it.
    if (clueSets.count(clue) === 0) {
      continue;
    }

    const guessStats: GuessStats = {
      guess,
      inSubset: subset.has(guess),
      numSets: clueSets.size,
      expected: clueSets.expectedSize(),
      singletons: clueSets.countOfSize(1),
      maxSet: {
        clue,
        size: clueSets.count(clue),
      }
    };

    if (showTelemetry && Math.random() < 0.001) {
      console.log(JSON.stringify(guessStats));
    }

    topGuesses.add(guessStats);
  }

  const results = topGuesses.getResults();

  // Append a word list to each of the top guesses.
  for (let i = 0; i < results.length; i++) {
    const guess = results[i];
    guess.maxSet.words = wordle.possibleWords(guess.guess, guess.maxSet.clue, subset);
  }

  return results;
}
