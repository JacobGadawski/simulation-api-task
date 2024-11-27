import { describe, it, expect, beforeEach } from 'vitest';
import Aggregator from '../../src/aggregator/aggregator';

describe('Aggregator Class', () => {
  let aggregator: Aggregator;

  beforeEach(() => {
    aggregator = new Aggregator();
  });

  it('should transform state data correctly', () => {
    const stateData = {
      odds: `event1,sport1,comp1,1709900432183,home1,away1,status1,period1@1:0|period2@2:1`,
    };

    const mappings = {
      sport1: 'Football',
      comp1: 'Champions League',
      home1: 'Team A',
      away1: 'Team B',
      status1: 'LIVE',
      period1: 'FIRST_HALF',
      period2: 'SECOND_HALF',
    };

    const expected = {
      event1: {
        id: 'event1',
        status: 'LIVE',
        scores: {
          FIRST_HALF: { type: 'FIRST_HALF', home: '1', away: '0' },
          SECOND_HALF: { type: 'SECOND_HALF', home: '2', away: '1' },
        },
        startTime: '2024-03-08T12:20:32.183Z',
        sport: 'Football',
        competitors: {
          HOME: { type: 'HOME', name: 'Team A' },
          AWAY: { type: 'AWAY', name: 'Team B' },
        },
        competition: 'Champions League',
      },
    };

    const result = aggregator.transform(stateData, { mappings });
    expect(result).toEqual(expected);
  });

  it('should parse scores correctly', () => {
    const scoresString = 'period1@1:0|period2@2:1';
    const mappings = {
      period1: 'FIRST_HALF',
      period2: 'SECOND_HALF',
    };

    const expected = {
      FIRST_HALF: { type: 'FIRST_HALF', home: '1', away: '0' },
      SECOND_HALF: { type: 'SECOND_HALF', home: '2', away: '1' },
    };

    // Accessing private method via casting
    const result = (aggregator as any).parseScores(scoresString, mappings);
    expect(result).toEqual(expected);
  });
});
