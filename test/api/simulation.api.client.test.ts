import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import MissingSimulationApiBaseUrlError from '../../src/errors/MissingSimulationApiBaseUrlError';
import { ISimulationApiStateResponse, ISimulationApiMappingsResponse } from '../../src/api/interface';
import SimulationApiClient from '../../src/api/simulation.api.client';

vi.mock('node-fetch', async () => {
  const actual = await vi.importActual<typeof import('node-fetch')>('node-fetch');
  return {
    ...actual,
    default: vi.fn(),
  };
});

describe('SimulationApiClient', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let simulationApiClient: SimulationApiClient;
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    originalEnv = { ...process.env };
    process.env.SIMULATIONAPI_BASE_URL = 'http://test-api.com';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should throw MissingSimulationApiBaseUrlError if SIMULATIONAPI_BASE_URL is not defined', () => {
    delete process.env.SIMULATIONAPI_BASE_URL;

    expect(() => new SimulationApiClient()).toThrow(MissingSimulationApiBaseUrlError);
  });

  it('should fetch state data successfully', async () => {
    const mockState: ISimulationApiStateResponse = { odds: 'mock-state-data' };
    global.fetch = mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockState),
    } as Response);

    simulationApiClient = new SimulationApiClient();
    const state = await simulationApiClient.getState();

    expect(mockFetch).toHaveBeenCalledWith('http://test-api.com/api/state');
    expect(state).toEqual(mockState);
  });

  it('should throw an error if fetching state data fails', async () => {
    global.fetch = mockFetch.mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error',
    } as Response);

    simulationApiClient = new SimulationApiClient();

    await expect(simulationApiClient.getState()).rejects.toThrow('Failed to fetch state data: Internal Server Error');
    expect(mockFetch).toHaveBeenCalledWith('http://test-api.com/api/state');
  });

  it('should fetch mappings data successfully', async () => {
    const mockMappings: ISimulationApiMappingsResponse = { mappings: 'mock-mappings-data' };
    global.fetch = mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockMappings),
    } as Response);

    simulationApiClient = new SimulationApiClient();
    const mappings = await simulationApiClient.getMappings();

    expect(mockFetch).toHaveBeenCalledWith('http://test-api.com/api/mappings');
    expect(mappings).toEqual(mockMappings);
  });

  it('should throw an error if fetching mappings data fails', async () => {
    global.fetch = mockFetch.mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
    } as Response);

    simulationApiClient = new SimulationApiClient();

    await expect(simulationApiClient.getMappings()).rejects.toThrow('Failed to fetch mappings data: Not Found');
    expect(mockFetch).toHaveBeenCalledWith('http://test-api.com/api/mappings');
  });
});
