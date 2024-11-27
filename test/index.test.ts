import { describe, it, expect, vi } from 'vitest';
import { Worker } from 'worker_threads';
import path from 'path';

vi.mock('worker_threads', () => ({
  Worker: vi.fn(() => ({
    postMessage: vi.fn(),
    on: vi.fn(),
    terminate: vi.fn(),
  })),
}));

vi.mock('../server/server', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockResolvedValue(1),
    stop: vi.fn().mockResolvedValue(1),
  })),
}));

vi.mock('../aggregator/aggregator', () => vi.fn());
vi.mock('../api/simulation.api.client', () => vi.fn());
vi.mock('../repository/mappings.repository', () => vi.fn(() => ({
  clearMappings: vi.fn(),
  getAllMappings: vi.fn(() => ({})),
  updateMappings: vi.fn(),
})));
vi.mock('../repository/state.repository', () => vi.fn(() => ({
  clear: vi.fn(),
  hasEvent: vi.fn(() => false),
  cleanUpRemovedEvents: vi.fn(),
  updateState: vi.fn(),
})));

describe('Main Script Process', () => {
  it('should start the process and worker without throwing errors', async () => {
    // Import the script dynamically to allow mocking to take effect
    await expect(import('../src/index.js')).resolves.not.toThrow();

    // Verify the worker is initialized
    expect(Worker).toHaveBeenCalledWith(path.resolve(__dirname, '../src/consumer/consumer.js'));

    // Verify the worker received a start message
    const mockWorkerInstance = Worker.mock.results[0].value;
    expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith({ type: 'start' });
  });
});
