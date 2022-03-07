export { Request, MultiTrial };

interface Request {
  guesses: string[];
  // Cut off search if any partition grows larger than this.
  limit: number;
}

interface MultiTrial {
  guesses: string[];
  expected: number;
  max: number;
}
