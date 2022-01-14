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

  // Return the min and max elements (by count)
  minmax(): [T, T] {
    let min : number | undefined = undefined;
    let max : number | undefined = undefined;
    let minElt: T | undefined = undefined;
    let maxElt: T | undefined = undefined;

    for (let [t, count] of this.elements) {
      if (min === undefined || count < min) {
        min = count;
        minElt = t;
      }
      if (max === undefined || count > max) {
        max = count;
        maxElt = t;
      }
    }

    return [minElt!, maxElt!];
  }
}
