import { ISimulationApiStateResponse } from "../api/interface";
import { IStateResponse } from "../controller/interfaces/state-response.interface";

export default class Aggregator {

  transform(
    stateData: ISimulationApiStateResponse,
    options: { mappings: Record<string, string> }
  ): IStateResponse {
    const { mappings } = options;

    const events: IStateResponse = {};
    stateData.odds.split('\n').forEach((eventRow) => {
      const [eventId, sportId, competitionId, startTime, homeCompetitorId, awayCompetitorId, statusId, scores] =
        eventRow.split(',');

      events[eventId] = {
        id: eventId,
        status: mappings[statusId] || statusId,
        scores: scores ? this.parseScores(scores, mappings) : {}, // handle PRE status where scores are not available
        startTime: new Date(Number(startTime)).toISOString(),
        sport: mappings[sportId] || sportId,
        competitors: {
          HOME: {
            type: 'HOME',
            name: mappings[homeCompetitorId] || homeCompetitorId,
          },
          AWAY: {
            type: 'AWAY',
            name: mappings[awayCompetitorId] || awayCompetitorId,
          },
        },
        competition: mappings[competitionId] || competitionId,
      };
    });

    return events;
  }

  private parseScores(
    scoresString: string,
    mappings: Record<string, string>
  ): Record<string, { type: string; home: string; away: string }> {
    const scores: Record<string, { type: string; home: string; away: string }> = {};
    scoresString.split('|').forEach((score) => {
    const [periodId, periodScores] = score.split('@');
    const [home, away] = periodScores.split(':');
    const type = mappings[periodId] || periodId;

        scores[type] = {
            type,
            home,
            away,
        };
    });
    return scores
  }
}
