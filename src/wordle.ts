import { MultiSet } from './multiset.js';

export { Wordle, Clue, isValidClue };

// 5 characters from
// X - not in answer
// ! - correct letter in correct position
// ? - correct letter in wrong position
type Clue = string;

function isValidClue(clue: Clue): boolean {
  if (clue.length !== 5) {
    return false;
  }
  if (clue.match(/[^?!X]/)) {
    return false;
  }
  return true;
}

class Wordle {
  dict: string[];
  word: string;

  constructor(dict: string[]) {
    this.dict = dict;
    this.word = this.dict[Math.floor(Math.random() * this.dict.length)];
  }

  setWord(word: string) {
    if (!this.dict.includes(word)) {
      throw new Error(`Word ${word} not in dictionary`);
    }
    this.word = word;
  }

  setWordFast(word: string) {
    this.word = word;
  }

  makeGuess(guess: string): Clue {
    guess = guess.toLowerCase();
    let response: string[] = new Array(5).fill('X');
    const remaining = new MultiSet<string>();

    // Find exact matches first
    for (let i = 0; i < this.word.length; i++) {
      const letter = this.word[i];
      if (guess[i] === letter) {
        response[i] = '!';
      } else {
        remaining.add(letter);
      }
    }

    // Find matches in wrong position (don't double count!)
    for (let i = 0; i < guess.length; i++) {
      if (response[i] === '!') {
        continue;
      }
      const letter = guess[i];
      if (remaining.has(letter)) {
        response[i] = '?';
        remaining.remove(letter);
      }
    }

    return response.join('');
  }

  // Return all the words from subset that are candidates that match the clue
  // for a given guess.
  possibleWords(guess: string, clue: Clue, subset: Set<string>): string[] {
    const saveWord = this.word;
    clue = clue.toUpperCase();
    const words = [];
    for (let word of subset) {
      this.setWordFast(word);
      if (this.makeGuess(guess) === clue) {
        words.push(word);
      }
    }
    this.word = saveWord;
    return words;
  }

  // Return all possible clue patterns for the given guess and subset of possible
  // words.  Return of map of clues to each partition of words.
  allClues(guess: string, subset: Set<string>): Map<Clue, Set<string>> {
    const saveWord = this.word;
    const clues = new Map<Clue, Set<string>>();

    for (let word of subset) {
      this.setWordFast(word);
      const clue = this.makeGuess(guess);
      if (!clues.has(clue)) {
        clues.set(clue, new Set());
      }
      clues.get(clue)!.add(word);
    }

    this.word = saveWord;
    return clues;
  }
}
