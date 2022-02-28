export { MultiSet };

class MultiSet<T> {
  elements:Map<T, number> = new Map();
  _size = 0;

  constructor() {
  }

  [Symbol.iterator]() {
    return this.elements.keys();
  }

  add(element: T) {
    if (this.elements.has(element)) {
      this.elements.set(element, this.elements.get(element)! + 1);
    } else {
      this.elements.set(element, 1);
    }
    this._size++;
  }

  remove(element: T) {
    if (!this.elements.has(element)) {
      throw new Error(`Non-existent ${element} cannot be removed.`);
    }

    const count = this.elements.get(element)!;

    if (count === 1) {
      this.elements.delete(element);
    } else {
      this.elements.set(element, count - 1);
    }
    this._size--;
  }

  get unique(): number {
    return this.elements.size;
  }

  get size(): number {
    return this._size;
  }

  has(element: T): boolean {
    return this.count(element) > 0;
  }

  count(element: T): number {
    if (this.elements.has(element)) {
      return this.elements.get(element)!;
    } else {
      return 0;
    }
  }

  // Return the element that occurs most frequently in the multi-set.
  mostFrequent(): T {
    let maxCount : number | undefined = undefined;
    let elt: T | undefined = undefined;

    for (let [t, count] of this.elements) {
      if (maxCount === undefined || count > maxCount) {
        maxCount = count;
        elt = t;
      }
    }

    return elt!;
  }

  // The expected frequency of a randomly chosen element (since P(S) * count(S)
  // = count(S)/N * count(S).
  expectedSize(): number {
    let sumSquare = 0;
    let sum = 0;
    for (let count of this.elements.values()) {
      sumSquare += count ** 2;
      sum += count;
    }
    return sumSquare / sum;
  }

  countOfSize(size: number): number {
    let result = 0;

    for (let [_, count] of this.elements) {
      if (count === size) {
        result++;
      }
    }

    return result;
  }

  toString(): string {
    const results = Array.from(this.elements.keys()).map(k => `${k}: ${this.count(k)}`);
    return results.join('\n');
  }

}
