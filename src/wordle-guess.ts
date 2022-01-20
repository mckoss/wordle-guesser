import { Clue, Wordle } from './wordle.js';
import { MultiSet } from './multiset.js';
import { Top } from './top.js';
import { stat } from 'fs';

export { analyze, telemetry };

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

// Return the top guesses and stats for the possible words.
function analyze(dict: string[], top=10, subset?: Set<string>): GuessStats[] {
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
  const topGuesses = new Top<GuessStats>(top, rankStat);

  // We can guess any word in the larger dictionary despite how big
  // the current subset may be.
  // TODO: Should be choose words from subset instead?
  // I tried and it increased the number of guesses by 1.
  // I think because the words that remain may not offer as much
  // discrimination.
  for (let guess of dict) {
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
      numSets: clueSets.size(),
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
