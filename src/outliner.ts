// Given a sequence of strings, return the index of the first
// string that is unique (w.r.t to the previous sequence).

export { Outliner };

class Outliner {
  last: string[];

  constructor() {
    this.last = [];
  }

  level(seq: string[]): number {
    for (let i = 0; i < seq.length; i++) {
      if (i > this.last.length || seq[i] !== this.last[i]) {
        this.last = seq;
        return i;
      }
    }
    return seq.length;
  }
}