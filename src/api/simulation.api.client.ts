import MissingSimulationApiBaseUrlError from "../errors/MissingSimulationApiBaseUrlError";
import { ISimulationApiMappingsResponse, ISimulationApiStateResponse } from "./interface";

export default class SimulationApiClient {
    private httpClient: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> = fetch;
    private baseUrl: string | undefined 
    constructor() {
        if(!process.env.SIMULATIONAPI_BASE_URL) throw new MissingSimulationApiBaseUrlError();
        this.baseUrl = process.env.SIMULATIONAPI_BASE_URL
    }
    async getState(): Promise<ISimulationApiStateResponse> {
        const stateResponse = await this.httpClient(`${this.baseUrl}/api/state`);
        if (!stateResponse.ok) {
            throw new Error(`Failed to fetch state data: ${stateResponse.statusText}`);
        }
        const state = await stateResponse.json();
        return state
    }
    async getMappings(): Promise<ISimulationApiMappingsResponse> {
        const mappingsResponse = await this.httpClient(`${this.baseUrl}/api/mappings`);
        if (!mappingsResponse.ok) {
            throw new Error(`Failed to fetch mappings data: ${mappingsResponse.statusText}`);
        }
        return await mappingsResponse.json();
    }
}