# worlde-guesser

Rehashing my old mastermind solver to play wordle.

See [Wordle](https://www.powerlanguage.co.uk/wordle/) by
[Josh Wardle](https://github.com/powerlanguage).

This game started to become
[super popular](https://www.nytimes.com/2022/01/03/technology/wordle-word-game-creator.html)
in December 2021.

One of my friends pointed out that they have identified a really good set of starting
words that helps them get to a solution in (often) 4 guesses or less.

This made me think about a program I wrote (in C++) in
[1995](https://github.com/mckoss/startpad/blob/6d30b86ae81bb74c551a3116e75527110ca5c7be/labs/cpp/Mastermind/Mstrmind.cpp)
that would play the role of the guesser in the [Mastermind](https://webgamesonline.com/mastermind/).  The realization
I had was the Mastermind is susceptible to a brute-force strategy.

# Minimax Algorithm

I imagined by Mastermind adversary being allow to *change* the values of the hidden
colored balls, so long as the new choice would be consistent with all the clues
given to the guesser so far.

In that case, the optimal strategy for the guesser would be to pick a guess that would
be the least-worst.

The pseudo-code would go something like this:

1. Start with the set of all possible hidden colors.
2. Choose a guess, so that *no matter the clue given* for that answer,
   the number of possibilities remaining would be minimized.
3. For each possible guess, each possible clue would result in a set of
   possible remaining hidden colors.  We choose the guess that minimizes
   the size of the maximum set that could be remaining if our opponent
   was able to select the least-favorable clue to our guess.

The aim here is to take that idea and use it to form the optimal strategy
for playing Wordle.

Note that there is one single "best first guess" (it mastermind, I found it
was to play two colors of two marbles each).

# Questions I Hope to Answer

- What is the best "first guess" for Wordle?
- For each of the possible responses, what are the best 2nd guesses?
- What is the expected number of guesses in a randomly selected Wordle
  puzzle using this algorithm?
- What is the hardest word to guess using this algorithm and how many guesses
  are needed?

