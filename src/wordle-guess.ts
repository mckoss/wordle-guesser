import { Clue, Wordle } from './wordle.js';
import { MultiSet } from './multiset.js';
import { Top } from './top.js';

export { analyze };

interface SetRep {
  clue: Clue;
  size: number;
  words?: string[];
}

interface GuessStats {
  guess: string;
  maxSet: SetRep;
}

// Return the top guesses and stats for the possible words.
function analyze(dict: string[], top=10, subset?: Set<string>): GuessStats[] {
  if (!subset) {
    subset = new Set(dict);
  }

  const wordle = new Wordle(dict);
  const topGuesses = new Top<GuessStats, number>(top, stat => stat.maxSet.size);

  // We can guess any word in the larger dictionary despite how big
  // the current subset may be.
  for (let guess of dict) {
    const clueSets = new MultiSet<Clue>();

    // Count up how many possible (remaining) words correspond with each
    // possible clue.
    for (let hidden of subset) {
      wordle.setWordFast(hidden);
      const clue = wordle.makeGuess(guess);
      clueSets.add(clue);
    }

    const [ _, max ] = clueSets.minmax();

    topGuesses.add({
      guess,
      maxSet: {
        clue: max,
        size: clueSets.count(max),
      }
    });
  }

  return topGuesses.getResults();
}
