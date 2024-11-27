import { describe, it, expect, beforeEach, vi } from 'vitest';
import http from 'http';
import Server from '../../src/server/server';
import StateRepository from '../../src/repository/state.repository';

vi.mock('http');

describe('Server Class', () => {
  let server: Server;
  let stateRepository: StateRepository;
  let mockHttpServer: http.Server;

  const mockStateData = {
    event1: { id: 'event1', status: 'LIVE' },
    event2: { id: 'event2', status: 'REMOVED' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  
    // Mock StateRepository
    stateRepository = new StateRepository();
    vi.spyOn(stateRepository, 'getState').mockReturnValue(mockStateData);
  
    // Mock http.createServer and its methods
    mockHttpServer = {
      listen: vi.fn((port: number, callback: () => void) => setImmediate(callback)), // Simulate async callback
      close: vi.fn((callback: (err?: Error) => void) => setImmediate(() => callback(null))), // Simulate async callback
    } as unknown as http.Server;
  
    (http.createServer as vi.Mock).mockReturnValue(mockHttpServer);
  
    server = new Server(3000, stateRepository);
  });

  it('should create an http server with the correct handler', () => {
    expect(http.createServer).toHaveBeenCalledWith(expect.any(Function));
    expect(server).toBeInstanceOf(Server);
  });

  it('should stop the server', async () => {
    await server.start();
    await server.stop();

    expect(mockHttpServer.close).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should throw an error if stopping the server fails', async () => {
    (mockHttpServer.close as vi.Mock).mockImplementationOnce((callback: (err?: Error) => void) =>
      callback(new Error('Server close error'))
    );

    await server.start();
    await expect(server.stop()).rejects.toThrow('Server close error');
  });
});
