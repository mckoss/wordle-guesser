import { readFile } from 'fs/promises';
import { exit } from 'process';
import { analyze, telemetry, rankExpected, rankStat, rankWorst } from './wordle-guess.js';

async function main(args: string[]) {
  let rankFunction = rankStat;
  let hardMode = false;
  let showTop = false;
  let top = 10;

  const dict: string[] = JSON.parse(await readFile('data/words.json', 'utf8'));
  const solutions: string[] = JSON.parse(await readFile('data/solutions.json', 'utf8'));

  for (const option of args) {
    if (option.startsWith('--')) {
      const [, name, value] = option.match(/^--([^=]+)=?(.*)$/) || [];
      if (name === 'help') {
        help();
      } else if (name === 'expected') {
        rankFunction = rankExpected;
      } else if (name === 'worst') {
        rankFunction = rankWorst;
      } else if (name === 'hard') {
        hardMode = true;
      } else if (name === 'telemetry') {
        telemetry(true);
      } else if (name === 'top') {
        showTop = true;
        if (value !== '') {
          top = parseInt(value);
          if (isNaN(top) || top < 1) {
            help(`Invalid top value: ${value}`);
          }
        }
      } else {
        help(`Unknown option: ${option}`);
      }
    } else {
      help(`Invalid argument: ${option}`);
    }
  }

  const guesses = analyze(dict, top, new Set(solutions), rankFunction, hardMode);
  console.log(`Optimal first guess is '${guesses[0].guess}' with at most ` +
    `${guesses[0].maxSet.size} words remaining`);
  if (showTop) {
    console.log(guesses);
  }
}

function help(msg?: string) {
  if (msg) {
    console.error(msg + '\n');
  }

  console.log(`
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
`);

  exit(msg === undefined ? 0 : 1);
}

main(process.argv.slice(2));
