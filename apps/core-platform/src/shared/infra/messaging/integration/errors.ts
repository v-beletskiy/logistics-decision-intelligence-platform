/**
 * Signals a deterministic integration-consumer failure. Consumers must not retry
 * these messages; each boundary decides whether to acknowledge or dead-letter
 * them according to its delivery guarantees.
 */
export class NonRetryableMessageException extends Error {}
