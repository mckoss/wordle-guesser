import { Clue, Wordle } from './wordle.js';
import { MultiSet } from './multiset.js';
import { Top } from './top.js';
import { stat } from 'fs';

export { analyze };

interface SetRep {
  clue: Clue;
  size: number;
  words?: string[];
}

interface GuessStats {
  guess: string;
  inSubset: boolean;
  numSets: number;
  maxSet: SetRep;
}

// Smaller is "better"
function rankStat(a: GuessStats, b: GuessStats): boolean {
  if (a.maxSet.size < b.maxSet.size) {
    return true;
  }
  if (a.inSubset && !b.inSubset) {
    return true;
  }
  return false;
}

// Return the top guesses and stats for the possible words.
function analyze(dict: string[], top=10, subset?: Set<string>): GuessStats[] {
  if (!subset) {
    subset = new Set(dict);
  }

  // The word is determined already.
  if (subset.size === 1) {
    const guess = Array.from(subset)[0];
    return [{
      guess,
      inSubset: true,
      numSets: 1,
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

    // Impossible guess
    if (clueSets.count(clue) === 0) {
      continue;
    }

    topGuesses.add({
      guess,
      inSubset: subset.has(guess),
      numSets: clueSets.size(),
      maxSet: {
        clue,
        size: clueSets.count(clue),
      }
    });
  }

  const results = topGuesses.getResults();

  // Append a word list to each of the top guesses.
  for (let i = 0; i < results.length; i++) {
    const guess = results[i];
    guess.maxSet.words = wordle.possibleWords(guess.guess, guess.maxSet.clue, subset);
  }

  return results;
}
