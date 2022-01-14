export { Top };

// Collect the "top" elements according to a MINIMIZING a scoring function.

class Top<T, Comp> {
  top: number;
  score: (t: T) => Comp;
  results: T[];

  constructor(top = 10, score: (t: T) => Comp) {
    this.top = top;
    this.score = score;
    this.results = [];
  }

  add(t: T) {
    const i = binarySearch<T, Comp>(t, this.results, this.score);
    this.results.splice(i, 0, t);
    if (this.results.length > this.top) {
      this.results.pop();
    }
  }

  getResults(): T[] {
    return this.results;
  }
}

// Binary search array that is sorted in ascending order by the result
// of comparing the results of the score function (must be comparable using
// the '>' operator).
function binarySearch<T, Comp>(t: T, arr: T[], score: (t: T) => Comp): number {
  let low = 0;
  let high = arr.length - 1;
  let mid: number;

  while (low <= high) {
    mid = Math.floor((low + high) / 2);

    if (score(t) > score(arr[mid])) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return low;
}
