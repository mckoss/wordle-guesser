# wordle-guesser

Rehashing my old mastermind solver to play wordle.

See [Wordle](https://www.powerlanguage.co.uk/wordle/) by
[Josh Wardle](https://github.com/powerlanguage).

This game started to become
[super popular](https://www.nytimes.com/2022/01/03/technology/wordle-word-game-creator.html)
in December 2021.

One of my friends pointed out that they have identified a really good set of starting
words that helps them get to a solution in (often) 5 guesses.  He suggested to always
make these your first 4 guesses:

- EATEN
- SHORE
- LUCID
- COMFY

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

1. Start with the set of all possible unknown colors.
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
  - **RAISE** - This is the best first guess given the Wordle dictionaries.
    No matter the response, it leaves no more than **168** words in the possibility
    set and and expected size of only **61** possible remaining words.  There
    are **132* possible clue patterns that can be given in response (compare
    to `3^5 = 243` possible theoretical patterns for any random string of 5
    letters).
- For each of the possible responses, what are the best 2nd guesses?
- What is the expected number of guesses in a randomly selected Wordle
  puzzle using this algorithm?
  - **3.5** - With the current tuning, this algorithm finds the hidden word
  in an average of 3.5 guesses.  The worst case seems to be 6.
- What is the hardest word to guess using this algorithm and how many guesses
  are needed?

# Using this repo

```
$ source tools/use     # Setup PATH for commands in this repo.
$ npm install
$ build
$ npm test
```

# Node Command-line Programs

```
$ play
```

This program will make guesses - you provide the "clue" patterns for each guess.

```
$ test-runner
```

This outputs some statistical data on the program making guesses against
a word list.  By default - it reads `data/test-words.json`.  A command
line option can be used to run against the full Wordle solution set:

```
$ test-runner solutions              # Test against the whole solutions.json list
$ test-runner --sample 20 solutions  # Take a random sample of 20 words
```

The output format is a CSV file with 3 columns

- Initial unknown word.
- Guess history.
- Number of guesses it took to find.

```
welsh,raise!-(9-E1.9-M3-S4)-chess!-(1-E1.0-M1-S1)-welsh!,3
betas,not-in-solution-set,#N/A
beefy,raise!-(121-E5.0-M14-S20)-betel!-(2-E1.0-M1-S2)-beech!-(1-E1.0-M1-S1)-beefy!,4
feces,not-in-solution-set,#N/A
fried,raise!-(12-E2.2-M4-S6)-fried!,2
items,not-in-solution-set,#N/A
razor,raise!-(9-E1.9-M3-S4)-randy!-(3-E1.0-M1-S3)-rajah!-(1-E1.0-M1-S1)-razor!,4
clear,raise!-(34-E3.5-M7-S8)-tread!-(1-E1.0-M1-S1)-clear!,3
sneak,raise!-(12-E1.7-M3-S7)-steak!-(2-E1.0-M1-S2)-sneak!,3
trust,raise!-(13-E1.3-M2-S9)-crust!-(1-E1.0-M1-S1)-trust!,3
petal,raise!-(69-E3.3-M6-S15)-cleat!-(3-E1.7-M2-S1)-fetal!-(2-E1.0-M1-S2)-metal!-(1-E1.0-M1-S1)-petal!,5
build,raise!-(51-E3.6-M7-S10)-cling!-(4-E1.0-M1-S4)-built!-(1-E1.0-M1-S1)-build!,4
ovule,not-in-solution-set,#N/A
peach,raise!-(69-E3.3-M6-S15)-cleat!-(3-E1.0-M1-S3)-beach!-(1-E1.0-M1-S1)-peach!,4
chews,not-in-solution-set,#N/A
debug,raise!-(121-E5.0-M14-S20)-betel!-(1-E1.0-M1-S1)-debug!,3
vista,raise!-(7-E1.0-M1-S7)-slain!-(1-E1.0-M1-S1)-vista!,3
polls,not-in-solution-set,#N/A
ships,not-in-solution-set,#N/A
howdy,raise!-(168-E6.3-M15-S19)-could!-(8-E1.3-M2-S6)-dowdy!-(1-E1.0-M1-S1)-howdy!,4
```

How to read each line:

```
world,raise!-(103-E4.8-M11-S19)-cloot-(2-E1.0-M1-S2)-lorry!-(1-E1.0-M1-S1)-world!,4
```

- `world` - The unknown word we are trying to guess.
- `raise!` - The first guessed word (! and still possibly the "answer" word).
- `103` - Number of words possible at the time of the previous guess.
- `E4.8` - The *expected* size (4.8 words) of the number of remaining words
  after getting one of the clues for the current word.
- `M11` - The *maximum* number possible words (11) possible no matter what the
  clue result could be.
- `S19` - The number of clue pattern *Singletons* - they can only be a result
  of a single word (and hence the puzzle would be solved in one more guess).
- `cloot` - The 2nd guess.  The lack of an `!` indicates that we know that the
  word has already been eliminated as a possible solution, but we use it as
  a better guess than the alternative in-solution words.
- `4` - The final score: how many guesses it took to find the hidden word.


# Data Wrangling

Data massaging for the input files for the JavaScript programs here is all done
in Python - see the [Jupyter Notebook](./tools/notebook.ipynb).

# Dual Targets

This repo has two different target environments it build for:

- The Browser environment
- The Node (command-line) environment

The build products are directed to the `/browser` and `/node` directories
respectively.

Some source files are node-specifc, some are browser-specific, and others (most)
are generic to be used in both environments.

The philosophy of this build system is to use ES-modules for all build targets
and then place the appropriate files in their respective target directories.

There are cases where the **same-named** module will appear in both the
browser and node source trees.  These modules need work differently in each
environment, but can be used identically by common code (e.g., the `prompt.ts`
module).

We currently use a single TypeScript build command to rebuild all output
javascript files as ES-modules in the `dist` directory.  The approriate files are
then copied over to either `node` or `browser` directories as needed.

The `static` folder also holds other browser-needed files (html and css files)
that are needed to serve the browser website (statically).