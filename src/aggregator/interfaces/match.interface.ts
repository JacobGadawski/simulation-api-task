export interface IMatch {
    id: string;
    status: string;
    scores: ScoreMap;
    startTime: string;
    sport: string;
    competitors: Competitors;
    competition: string;
  }
  
  export type ScoreMap = {
    [key in ScorePeriodEnum]?: ScoreDetail;
  };
    
  export interface ScoreDetail {
    type: string;
    home: string;
    away: string;
  }
  
  export interface Competitors {
    HOME: Home;
    AWAY: Away;
  }
  
  export interface Home {
    type: string;
    name: string;
  }
  
  export interface Away {
    type: string;
    name: string;
  }
  
  export enum ScorePeriodEnum {
    CURRENT = 'CURRENT',
    PERIOD_1 = 'PERIOD_1',
    PERIOD_2 = 'PERIOD_2',
    PERIOD_3 = 'PERIOD_3',
    PERIOD_4 = 'PERIOD_4',
  }
  