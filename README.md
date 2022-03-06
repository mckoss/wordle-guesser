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
  - **ROATE** - This is the best first guess given the Wordle dictionaries. No
    matter the response, it leaves no more than **195** words in the possibility
    set and and expected size of only **60.4** possible remaining words.  There
    are **126** possible clue patterns that can be given in response (compare to
    `3^5 = 243` possible theoretical patterns for any random string of 5
    letters).
    - But note that `roate` is NOT a possible solution to Wordle!  The 2nd best
      first guess is solution-word `raise` (dividing the words into **132**
      partitions, the largest of which has only **168** words - expected size: **61**).
- For each of the possible responses, what are the best 2nd guesses?
  See [decision-tree](./data/decision-tree.json).
- What is the expected number of guesses in a randomly selected Wordle
  puzzle using this algorithm?
  - **3.48** - With the current tuning, this algorithm finds the hidden word in
  an average of 3.49 guesses.  The worst case is 5 guesses (and only for less
  than 2% (39) of the words in the solution dictionary).
- What is the hardest word to guess using this algorithm and how many guesses
  are needed?
  - There are only 39 words that require 5 guesses: brook, folly, funny, fuzzy,
    giddy, goner, golly, gully, happy, jaunt, jazzy, jolly, judge, jiffy, liver,
    mammy, merry, nanny, ninny, paddy, piggy, pluck, pound, pulpy, puppy, shell,
    shrew, sneer, tatty, taunt, tight, vaunt, viper, wager, watch, waver, willy,
    winch, wreak
  - By replacing a few of the 2nd-guess words, this can be reduced to 22 words:
    savvy mamma jazzy watch vaunt paper jerky miner liver diver jiffy dimly
    hilly muddy hunky fuzzy mummy puppy wound vouch jolly goner
- Without knowing the responses a-priori, what would be the best 2 or 3 words to
  guess first?


## Tweaking the algorithm to optimize either the average or maximum number of guesses.

Is there a solution to Wordle that solves for EVERY word with no more than 4
guesses?  It seems possible, as there are only 39 words that require 5 from the
current algorithm.

```
$ test-runner --stats --silent

Algorithm: stat, margin: 0.15
Start word: roate
Total Words: 2315
Average guesses: 3.48
2: 60
3: 1119
4: 1097
5: 39

5-guess 1st clues:
??XXX: 1
X!XXX: 4
XXXXX: 12
?!XX?: 1
XX?XX: 5
XX??X: 4
XXXX!: 1
?XXX?: 5
XXXX?: 1
XX?!X: 1
XXX?X: 1
?X?X?: 3
```

If we are to admit no more than 4 guesses to any word, then the 2nd guess has to
ensure that every third guess reduces the set of possible words to no more than
1 word for each clue.

One plan would be to *pivot* the second guess away from the default algorithms
heuristic, to see if any of the resulting decision tree has either a smaller
maximum depth, or a better average depth.

# Using this repo

```
$ source tools/use     # Setup PATH for commands in this repo.
$ npm install
$ build
$ npm test
```

There are several commands implemented here to investigate Wordle.

# Node Command-line Programs

```
$ play
```

This program will make guesses - you provide the "clue" patterns for each guess.

```
$ test-runner --help

Usage:
  test-runner [options] [test-words-file]

  test-words-file: JSON file containing a list of words to test as array.

Options:
  --help         Show this help message.
  --hard         In hard mode - only guess words that remain possible.
  --expected     Rank guesses by expected size of partitions.
  --worst        Rank guesses by worst-case size of partitions.
  --sample=N     Only use a sample subset of the test words (default 20).
  --start=<word> Default first guess is [object Object].
  --silent       Don't print out each guess.
  --stats        Show stats and histogram of guesses.
  --margin=N     Set the margin of benefit for in-solution word for default ranking function
                 (default 0.15).
```

This outputs some statistical data on the program making guesses against
a word list.  By default - it reads `data/test-words.json`.  A command
line option can be used to run against the full Wordle solution set:

```
$ test-runner                   # Test against the whole solutions.json list
$ test-runner --sample=20       # Take a random sample of 20 words
```

The output format is a CSV file with 3 columns

- Initial unknown word.
- Guess history.
- Number of guesses it took to find.

```
ready,roate-(4-E1.0-M1-S4)-acold-(1-E1.0-M1-S1)-ready!,3
broke,roate-(19-E2.4-M5-S8)-phons-(5-E1.0-M1-S5)-bovid-(1-E1.0-M1-S1)-broke!,4
aware,roate-(23-E3.2-M5-S5)-crags-(3-E1.0-M1-S3)-blare!-(1-E1.0-M1-S1)-aware!,4
noose,roate-(22-E1.6-M3-S11)-gusli-(3-E1.0-M1-S3)-moose!-(1-E1.0-M1-S1)-noose!,4
cargo,roate-(28-E2.8-M5-S7)-armor!-(2-E1.0-M1-S2)-cargo!,3
pride,roate-(39-E2.7-M5-S12)-piums-(3-E1.0-M1-S3)-ached-(1-E1.0-M1-S1)-pride!,4
rebus,roate-(21-E1.8-M3-S8)-lupin-(2-E1.0-M1-S2)-rebus!,3
lefty,roate-(12-E1.3-M2-S8)-plesh-(1-E1.0-M1-S1)-lefty!,3
knock,roate-(66-E2.8-M5-S18)-snool-(2-E1.0-M1-S2)-knock!,3
dowdy,roate-(71-E4.7-M8-S12)-bludy-(5-E1.0-M1-S5)-hawms-(1-E1.0-M1-S1)-dowdy!,4
theme,roate-(17-E1.4-M2-S11)-cuish-(2-E1.0-M1-S2)-theme!,3
print,roate-(29-E1.7-M3-S15)-crust!-(2-E1.0-M1-S2)-drift!-(1-E1.0-M1-S1)-print!,4
sieve,roate-(83-E3.0-M6-S23)-sling-(1-E1.0-M1-S1)-sieve!,3
bleak,roate-(55-E2.9-M6-S11)-penal!-(2-E1.0-M1-S2)-bleak!,3
queer,roate-(102-E6.9-M18-S15)-feued-(1-E1.0-M1-S1)-queer!,3
steam,roate-(25-E2.2-M4-S9)-cleat!-(4-E1.0-M1-S4)-adsum-(1-E1.0-M1-S1)-steam!,4
tenet,roate-(56-E2.6-M6-S16)-sleet!-(2-E1.0-M1-S2)-beget!-(1-E1.0-M1-S1)-tenet!,4
smell,roate-(106-E3.7-M7-S20)-lenes-(6-E1.3-M2-S4)-bumph-(1-E1.0-M1-S1)-smell!,4
equip,roate-(106-E3.7-M7-S20)-lenes-(3-E1.0-M1-S3)-edify!-(1-E1.0-M1-S1)-equip!,4
giddy,roate-(195-E5.6-M13-S23)-slimy!-(13-E1.6-M2-S5)-panda-(2-E1.0-M1-S2)-biddy!-(1-E1.0-M1-S1)-giddy!,5

Algorithm: stat, margin: 0.15
Start word: roate
Total Words: 20
Average guesses: 3.60
3: 9
4: 10
5: 1
5-guess 1st clues:
XXXXX: 1
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

```
$ best-guess --help

Evaluate the best first word for a Wordle game.

Usage:
  best-guess [options]

Options:
  --help       Show this help message.
  --hard       In hard mode - only guess words that remain possible.
  --expected   Rank guesses by expected size of partitions.
  --worst      Rank guesses by worst-case size of partitions.
  --telemetry  Sample words during processing.
  --top=N      Show the top N guesses (default 10).
```

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