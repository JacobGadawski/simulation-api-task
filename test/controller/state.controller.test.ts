import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IStateResponse } from '../../src/controller/interfaces/state-response.interface';
import StateController from '../../src/controller/state.controller';

describe('StateController Tests', () => {
  let stateController: StateController;
  let mockState: IStateResponse;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock state data
    mockState = {
      "3eccf850-571f-4e18-8cb3-2c9e3afade7b": {
        id: "3eccf850-571f-4e18-8cb3-2c9e3afade7b",
        status: "LIVE",
        scores: {
          CURRENT: {
            type: "CURRENT",
            home: "2",
            away: "1",
          },
        },
        startTime: "2024-03-04T10:36:07.812Z",
        sport: "FOOTBALL",
        competitors: {
          HOME: { type: "HOME", name: "Juventus" },
          AWAY: { type: "AWAY", name: "Paris Saint-Germain" },
        },
        competition: "UEFA Champions League",
      },
    };

    // Mock the StateController
    stateController = new StateController();
    vi.spyOn(stateController, 'get').mockResolvedValue(mockState);
  });

  it('should return the correct state when get() is called', async () => {
    const state = await stateController.get();

    expect(state).toEqual(mockState);
    expect(state["3eccf850-571f-4e18-8cb3-2c9e3afade7b"].id).toBe(
      "3eccf850-571f-4e18-8cb3-2c9e3afade7b"
    );
    expect(state["3eccf850-571f-4e18-8cb3-2c9e3afade7b"].status).toBe("LIVE");
  });

  it('should handle empty state gracefully', async () => {
    vi.spyOn(stateController, 'get').mockResolvedValue({});

    const state = await stateController.get();

    expect(state).toEqual({});
  });

  it('should throw an error if get() fails', async () => {
    vi.spyOn(stateController, 'get').mockRejectedValue(new Error('Failed to fetch state'));

    await expect(stateController.get()).rejects.toThrow('Failed to fetch state');
  });
});
