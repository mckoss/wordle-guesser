export { MultiSet };

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
    if (!this.elements.has(element)) {
      throw new Error(`Non-existent ${element} cannot be removed.`);
    }

    const count = this.elements.get(element)!;

    if (count === 1) {
      this.elements.delete(element);
    } else {
      this.elements.set(element, count - 1);
    }
  }

  size(): number {
    return this.elements.size;
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

  // The expected frequency of a randomly chosen element (since P(S) * size(S)
  // = size(S)/N * size(S).
  expectedSize(): number {
    let sumSquare = 0;
    let sum = 0;
    for (let size of this.elements.values()) {
      sumSquare += size ** 2;
      sum += size;
    }
    return sumSquare / sum;
  }

}
