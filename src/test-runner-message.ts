export { Message, Result, RankFunctionName };

type RankFunctionName = 'stat' | 'expected' | 'worst';

type Message = {
  word: string,
  firstGuess: string,
  rankFunction: RankFunctionName,
  hardMode: boolean
};

type Result = {
  row: string,
  count: number
};
