export { Wordle, Response };

// 5 characters from
// X - not in answer
// ! - correct letter in correct position
// ? - correct letter in wrong position
type Response = string;

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

  makeGuess(guess: string): Response {
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

class MultiSet<T> {
  elements:Map<T, number> = new Map();

  constructor() {
  }

  add(element: T) {
    if (this.elements.has(element)) {
      this.elements.set(element, this.elements.get(element)! + 1);
    } else {
      this.elements.set(element, 1);
    }
  }

  remove(element: T) {
    if (this.elements.has(element)) {
      this.elements.set(element, this.elements.get(element)! - 1);
    } else {
      throw new Error(`Non-existent ${element} cannot be removed.`);
    }
  }

  has(element: T) {
    return this.elements.has(element) && this.elements.get(element)! > 0;
  }
}
