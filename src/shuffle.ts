export { shuffle };

function shuffle<T>(arr: T[]) {
  for (let i = 0; i < arr.length; i++) {
    const j = Math.floor(Math.random() * arr.length);
    // Swap ith and jth elements.
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
