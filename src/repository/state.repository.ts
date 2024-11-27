import { IMatch } from "../aggregator/interfaces/match.interface";
import { IStateResponse } from "../controller/interfaces/state-response.interface";

export default class StateRepository {
  private events: Map<string, IMatch>;

  constructor() {
    this.events = new Map();
  }

  updateState(newState: IStateResponse): void {
    for (const [id, event] of Object.entries(newState)) {
      this.events.set(id, event);
    }
  }

  getState(): IStateResponse {
    const state: IStateResponse = {};
    for (const [id, event] of this.events.entries()) {
      state[id] = event;
    }
    return state;
  }

  hasEvent(id: string): boolean {
    return this.events.has(id);
  }

  getEventById(id: string): IMatch | undefined {
    return this.events.get(id);
  }

  cleanUpRemovedEvents(newStateIds: Set<string>): void {
    for (const id of this.events.keys()) {
      if (!newStateIds.has(id)) {
        const removedEvent = this.events.get(id);
        if (removedEvent && removedEvent.status !== 'REMOVED') {
          this.events.set(id, {
            ...removedEvent,
            status: 'REMOVED',
          });
        }
      }
    }
  }
  

  clear(): void {
    return this.events.clear();
  }
}
