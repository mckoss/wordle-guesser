import readline from 'readline';

export { prompt };

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve, reject) => {
    rl.question(question + ': ', (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}
