import { describe, it, expect, beforeEach } from 'vitest';
import StateRepository from '../../src/repository/state.repository';
import { IMatch } from '../../src/aggregator/interfaces/match.interface';
import { IStateResponse } from '../../src/controller/interfaces/state-response.interface';

describe('StateRepository', () => {
  let repository: StateRepository;

  beforeEach(() => {
    repository = new StateRepository();
  });

  it('should update the state correctly', () => {
    const newState: IStateResponse = {
      event1: {
        id: 'event1',
        status: 'LIVE',
        scores: {},
        startTime: '2024-03-04T10:33:52.183Z',
        sport: 'Football',
        competitors: {
          HOME: { type: 'HOME', name: 'Team A' },
          AWAY: { type: 'AWAY', name: 'Team B' },
        },
        competition: 'Champions League',
      },
    };

    repository.updateState(newState);

    const result = repository.getState();
    expect(result).toEqual(newState);
  });

  it('should return true if an event exists', () => {
    const newState: IStateResponse = {
      event1: {
        id: 'event1',
        status: 'LIVE',
        scores: {},
        startTime: '2024-03-04T10:33:52.183Z',
        sport: 'Football',
        competitors: {
          HOME: { type: 'HOME', name: 'Team A' },
          AWAY: { type: 'AWAY', name: 'Team B' },
        },
        competition: 'Champions League',
      },
    };

    repository.updateState(newState);

    expect(repository.hasEvent('event1')).toBe(true);
    expect(repository.hasEvent('event2')).toBe(false);
  });

  it('should retrieve an event by its ID', () => {
    const newState: IStateResponse = {
      event1: {
        id: 'event1',
        status: 'LIVE',
        scores: {},
        startTime: '2024-03-04T10:33:52.183Z',
        sport: 'Football',
        competitors: {
          HOME: { type: 'HOME', name: 'Team A' },
          AWAY: { type: 'AWAY', name: 'Team B' },
        },
        competition: 'Champions League',
      },
    };

    repository.updateState(newState);

    const event = repository.getEventById('event1');
    expect(event).toEqual(newState.event1);

    const nonExistentEvent = repository.getEventById('event2');
    expect(nonExistentEvent).toBeUndefined();
  });

  it('should mark events as removed if they are not in the new state', () => {
    const initialState: IStateResponse = {
      event1: {
        id: 'event1',
        status: 'LIVE',
        scores: {},
        startTime: '2024-03-04T10:33:52.183Z',
        sport: 'Football',
        competitors: {
          HOME: { type: 'HOME', name: 'Team A' },
          AWAY: { type: 'AWAY', name: 'Team B' },
        },
        competition: 'Champions League',
      },
      event2: {
        id: 'event2',
        status: 'LIVE',
        scores: {},
        startTime: '2024-03-04T10:33:52.183Z',
        sport: 'Basketball',
        competitors: {
          HOME: { type: 'HOME', name: 'Team X' },
          AWAY: { type: 'AWAY', name: 'Team Y' },
        },
        competition: 'NBA Finals',
      },
    };

    repository.updateState(initialState);

    const newStateIds = new Set<string>(['event1']);
    repository.cleanUpRemovedEvents(newStateIds);

    const updatedState = repository.getState();
    expect(updatedState.event1.status).toBe('LIVE');
    expect(updatedState.event2.status).toBe('REMOVED');
  });

  it('should clear all events', () => {
    const initialState: IStateResponse = {
      event1: {
        id: 'event1',
        status: 'LIVE',
        scores: {},
        startTime: '2024-03-04T10:33:52.183Z',
        sport: 'Football',
        competitors: {
          HOME: { type: 'HOME', name: 'Team A' },
          AWAY: { type: 'AWAY', name: 'Team B' },
        },
        competition: 'Champions League',
      },
    };

    repository.updateState(initialState);
    repository.clear();

    const state = repository.getState();
    expect(state).toEqual({});
  });
});
