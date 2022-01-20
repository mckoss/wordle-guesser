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
  - **RAISE** - This is the best first guess given the Wordle dictionaries. No
    matter the response, it leaves no more than **168** words in the possibility
    set and and expected size of only **61** possible remaining words.  There
    are **132** possible clue patterns that can be given in response (compare to
    `3^5 = 243` possible theoretical patterns for any random string of 5
    letters).
- For each of the possible responses, what are the best 2nd guesses?
- What is the expected number of guesses in a randomly selected Wordle
  puzzle using this algorithm?
  - **3.53** - With the current tuning, this algorithm finds the hidden word
  in an average of 3.5 guesses.  The worst case seems to be 6.
- What is the hardest word to guess using this algorithm and how many guesses
  are needed?
  - gooey, greed, jolly, merry, pitch, power, punch, tight, vaunt, witty, wreak
    (all requiring 6 guesses).
- Without known the responses a-priori, what would be the best 2 or 3 words to
  guess first.

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
robin,raise!-(4-E1.0-M1-S4)-robin!,2
friar,raise!-(4-E1.5-M2-S2)-briar!-(1-E1.0-M1-S1)-friar!,3
mirth,raise!-(23-E1.9-M3-S12)-droit!-(3-E1.7-M2-S1)-birth!-(2-E1.0-M1-S2)-girth!-(1-E1.0-M1-S1)-mirth!,5
quart,raise!-(78-E4.7-M9-S13)-tronc-(4-E1.0-M1-S4)-altar!-(1-E1.0-M1-S1)-quart!,4
brake,raise!-(26-E3.8-M6-S4)-grace!-(6-E1.3-M2-S4)-drake!-(1-E1.0-M1-S1)-brake!,4
cease,raise!-(8-E1.8-M2-S2)-cease!,2
tried,raise!-(12-E2.2-M4-S6)-fried!-(4-E1.0-M1-S4)-capot-(1-E1.0-M1-S1)-tried!,4
mover,raise!-(102-E8.7-M16-S15)-outer!-(16-E3.0-M5-S2)-chowk-(5-E1.0-M1-S5)-balmy-(1-E1.0-M1-S1)-mover!,5
anger,raise!-(34-E3.5-M7-S8)-tread!-(7-E1.0-M1-S7)-learn!-(1-E1.0-M1-S1)-anger!,4
rabid,raise!-(6-E1.3-M2-S4)-rabid!,2
roast,raise!-(1-E1.0-M1-S1)-roast!,2
burly,raise!-(103-E4.8-M11-S19)-cloot-(3-E1.0-M1-S3)-dryly!-(1-E1.0-M1-S1)-burly!,4
paler,raise!-(28-E3.6-M7-S7)-empty-(2-E1.0-M1-S2)-paler!,3
duvet,raise!-(121-E5.0-M14-S20)-betel!-(5-E1.0-M1-S5)-comet!-(1-E1.0-M1-S1)-duvet!,4
offer,raise!-(102-E8.7-M16-S15)-outer!-(5-E1.8-M2-S1)-odder!-(2-E1.0-M1-S2)-offer!,4
ripen,raise!-(8-E2.0-M3-S3)-riper!-(1-E1.0-M1-S1)-ripen!,3
sally,raise!-(20-E2.3-M4-S8)-salon!-(3-E1.0-M1-S3)-sally!,3
flown,raise!-(168-E6.3-M15-S19)-could!-(5-E1.0-M1-S5)-bloom!-(1-E1.0-M1-S1)-flown!,4
group,raise!-(103-E4.8-M11-S19)-cloot-(11-E1.5-M2-S5)-frond!-(2-E1.0-M1-S2)-group!,4
abide,raise!-(5-E1.4-M2-S3)-alike!-(2-E1.0-M1-S2)-abide!,3
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

I experimented with several English dictionaries to source word lists until
being told about [this respository](https://github.com/AllValley/WordleDictionary).
It seems to match the Wordle web site with 2,315 possible solution words
chosen from a larger legal-guess dictionary of 12,897 (5-letter) words.

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