// For first guess, 'crane', the following exceptions for the second guess
// reduce the total number of 5-guess words to 30.

export { optimizations };

const optimizationTable =
[
    {
      "clue": "XX!X!",
      "algoGuess": "stulm",
      "optGuess": "stalk"
    },
    {
      "clue": "XX?XX",
      "algoGuess": "toils",
      "optGuess": "talas"
    },
    {
      "clue": "X??XX",
      "algoGuess": "yarto",
      "optGuess": "rorty"
    },
    {
      "clue": "XX?X!",
      "algoGuess": "mauls",
      "optGuess": "pauls"
    },
    {
      "clue": "XXXX?",
      "algoGuess": "sleet",
      "optGuess": "betel"
    },
    {
      "clue": "X?XX?",
      "algoGuess": "lotes",
      "optGuess": "roist"
    }
];

const optimizations = new Map<string, string>();

for (const opt of optimizationTable) {
  optimizations.set(opt.clue, opt.optGuess);
}
