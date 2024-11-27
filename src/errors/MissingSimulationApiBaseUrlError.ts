export default class MissingSimulationApiBaseUrlError extends Error {
    constructor() {
        super(`${MissingSimulationApiBaseUrlError.name}: Missing simulation apis base url`)
    }
}