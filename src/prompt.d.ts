// This file is needed because we have both node and browser implementations
// of the same module "interface".

export { prompt };
declare function prompt(question: string): Promise<string>;
