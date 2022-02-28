import { Worker } from 'worker_threads';

export { Pool };

class Pool<In, Out> {
  freePool: Set<Worker> = new Set();
  busyPool: Set<Worker> = new Set();
  waiting: ((worker: Worker) => void)[] = [];
  callback: (message: Out) => void;
  completePromise: Promise<void> | undefined;
  completeResolver: (() => void) | undefined;

  constructor(numWorkers: number, script: string, callback: (message: Out) => void) {
    this.callback = callback;
    for (let i = 0; i < numWorkers; i++) {
      const worker = new Worker(script);
      this.freePool.add(worker);
      worker.on("message", (message: Out) => {
        callback(message);
        this.busyPool.delete(worker);
        this.freePool.add(worker);
        this.checkWaiting();
      });
      worker.on("exit", () => {
        if (this.freePool.has(worker)) {
          this.freePool.delete(worker);
        }
        if (this.busyPool.has(worker)) {
          this.busyPool.delete(worker);
        }
      });
    }
  }

  // Resolves as soon as the worker is CALLED - not when it finishes.
  async call(message: In) {
    const worker = await this.nextWorker();
    worker.postMessage(message);
  }

  async checkWaiting() {
    if (this.waiting.length === 0) {
      if (this.busyPool.size === 0 && this.completeResolver) {
        this.killWorkers();
        this.completeResolver();
      }
      return;
    }
    const resolver = this.waiting.shift()!;
    resolver(await this.nextWorker());
  }

  killWorkers() {
    for (const worker of this.freePool) {
      worker.terminate();
    }
    for (const worker of this.busyPool) {
      worker.terminate();
    }
  }

  async nextWorker(): Promise<Worker> {
    if (this.freePool.size === 0) {
      const waiting = new Promise<Worker>((resolve, reject) => {
        this.waiting.push(resolve);
      });
      return waiting;
    }
    const worker = this.freePool.values().next().value;
    this.freePool.delete(worker);
    this.busyPool.add(worker);
    return worker;
  }

  async complete(): Promise<void> {
    if (this.busyPool.size === 0) {
      return;
    }
    if (this.completeResolver) {
      return this.completePromise;
    }
    this.completePromise = new Promise<void>((resolve, reject) => {
      this.completeResolver = resolve;
    });
    return this.completePromise;
  }
}
