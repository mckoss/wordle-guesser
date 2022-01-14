import { MultiSet } from './multiset.js';

export { Wordle, Clue };

// 5 characters from
// X - not in answer
// ! - correct letter in correct position
// ? - correct letter in wrong position
type Clue = string;

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
      const letter = guess[i];
      if (remaining.has(letter)) {
        response[i] = '?';
        remaining.remove(letter);
      }
    }

    return response.join('');
  }
}
