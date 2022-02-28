import { exit } from 'process';
import { parentPort } from 'worker_threads';

parentPort!.on("message", (message: number) => {
  parentPort!.postMessage(message * 2);
});
