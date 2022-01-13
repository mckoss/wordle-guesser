import { Response } from './wordle';
export { getGuesses };


interface GuessStats {
  guess: string;
  minSet: {
    size: number;
    response: Response;
  },
  maxSet: {
    size: number;
    response: Response;
  },
}

interface Guesses {
  bestGuess: GuessStats;
  worstGuess: GuessStats;
};

// Return the word guess that has the fewest number of possible words
// in the set of remaining words based on a response to the word.
function getGuesses(dict: Set<string>) {
}
