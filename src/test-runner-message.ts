export { Message, Result, RankFunctionName };

type RankFunctionName = 'stat' | 'expected' | 'worst';

type Message = {
  word: string,
  firstGuess: string,
  rankFunction: RankFunctionName,
  insetMargin: number,
  hardMode: boolean
};

type Result = {
  row: string,
  count: number
};
