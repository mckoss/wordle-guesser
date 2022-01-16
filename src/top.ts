export { Top };

// Collect the "top" elements according to a MINIMIZING a scoring function.

type CmpLT<T> = (a: T, b: T) => boolean;

class Top<T> {
  top: number;
  cmpLT: CmpLT<T>;
  results: T[];

  constructor(top = 10, cmpLT: CmpLT<T>) {
    this.top = top;
    this.cmpLT = cmpLT;
    this.results = [];
  }

  add(t: T) {
    const i = binarySearch<T>(t, this.results, this.cmpLT);
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
function binarySearch<T>(t: T, arr: T[], cmpLT: CmpLT<T>): number {
  let low = 0;
  let high = arr.length - 1;
  let mid: number;

  while (low <= high) {
    mid = Math.floor((low + high) / 2);

    if (cmpLT(t, arr[mid])) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return low;
}
