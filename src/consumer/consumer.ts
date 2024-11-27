import { parentPort, isMainThread } from 'worker_threads';
import ConsumerError from '../errors/ConsumerError';
import SimulationApiClient from '../api/simulation.api.client';

export default class Consumer {
  private client: SimulationApiClient;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.client = new SimulationApiClient();
  }

  async start(): Promise<void> {
    if (this.intervalId) {
      throw new ConsumerError('Consumer is already running');
    }

    this.intervalId = setInterval(async () => {
      try {
        const stateData = await this.client.getState();

        if (parentPort) {
          parentPort.postMessage({ type: 'state', data: stateData });
        }
      } catch (error) {
        console.error('Error fetching state data:', error);
      }
    }, 1000);
  }

  stop(): void {
    if (!this.intervalId) {
      throw new ConsumerError('Consumer is not running');
    }

    clearInterval(this.intervalId);
    this.intervalId = null;
  }
}

if (!isMainThread) {
  // Run the consumer in the worker thread
  const consumer = new Consumer();

  parentPort?.on('message', async (message) => {
    if (message.type === 'start') {
      await consumer.start();
    } else if (message.type === 'stop') {
      consumer.stop();
    }
  });
}
