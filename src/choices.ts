export { choices, binomial };

// Return tuple of count elements between 0 and n-1
// beginning with 0, 1, 2, ... count-1 and ending with
// n - count, n - count + 1, ... n - 1.
function *choices(m: number, n: number, first = 0) : Generator<number[]> {
  if (n === 0) {
    yield [];
    return;
  }

  for (let i = first; i < m; i++) {
    for (const rest of choices(m, n - 1, i + 1)) {
      yield [i, ...rest];
    }
  }
}

function binomial(m: number, n: number) : number {
    var result = 1;

    if (n > m - n) {
      n = m - n;
    }

    for (let i = 1; i <= n; i++){
      result *= m - i + 1
      result /= i;
    }

    return result;
}
