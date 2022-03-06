// For first guess, 'roate', the following exceptions for the second guess
// reduce the total number of 5-guess words from 39 to 22.

export { optimizations };

const optimizationTable = [
  {
    "clue": "XX?XX",
    "algoGuess": "lysin",
    "optGuess": "linds"
  },
  {
    "clue": "XX??X",
    "algoGuess": "clint",
    "optGuess": "haunt"
  },
  {
    "clue": "?X?X?",
    "algoGuess": "balms",
    "optGuess": "bawls"
  },
  {
    "clue": "XX?!X",
    "algoGuess": "snipy",
    "optGuess": "cuspy"
  },
  {
    "clue": "XXXX?",
    "algoGuess": "lenes",
    "optGuess": "bedel"
  },
  {
    "clue": "XXXX!",
    "algoGuess": "sling",
    "optGuess": "nidus"
  },
  {
    "clue": "?XXX?",
    "algoGuess": "feued",
    "optGuess": "feeds"
  },
  {
    "clue": "XXXXX",
    "algoGuess": "slimy",
    "optGuess": "sculp"
  },
  {
    "clue": "XXX?X",
    "algoGuess": "shunt",
    "optGuess": "stint"
  },
  {
    "clue": "X!XXX",
    "algoGuess": "bludy",
    "optGuess": "scold"
  },
  {
    "clue": "??XXX",
    "algoGuess": "croon",
    "optGuess": "crowd"
  }
];

const optimizations = new Map<string, string>();

for (const opt of optimizationTable) {
  optimizations.set(opt.clue, opt.optGuess);
}
