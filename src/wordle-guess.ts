import { Clue, Wordle } from './wordle.js';
import { MultiSet } from './multiset.js';

export { getGuess };

interface SetRep {
  size: number;
  clue: Clue;
}

interface GuessStats {
  guess: string;
  minSet: SetRep;
  maxSet: SetRep;
}

// Return the word guess that has the fewest number of possible words
// in the set of remaining words based on a response to the word.
function getGuess(dict: string[], subset?: Set<string>): GuessStats {
  if (!subset) {
    subset = new Set(dict);
  }

  const wordle = new Wordle(dict);
  let best: GuessStats | undefined = undefined;

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

    const [ min, max ] = clueSets.minmax();

    if (best === undefined || clueSets.count(max) < best.maxSet.size) {
      best = {
        guess,
        minSet: {
          size: clueSets.count(min),
          clue: min
        },
        maxSet: {
          size: clueSets.count(max),
          clue: max
        }
      };
    }
  }

  return best!;
}
