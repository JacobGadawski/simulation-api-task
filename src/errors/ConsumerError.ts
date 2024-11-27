export default class ConsumerError extends Error {
    constructor(message: string) {
        super(`${ConsumerError.name}: ${message}`)
    }
}