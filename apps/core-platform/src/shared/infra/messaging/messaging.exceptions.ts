/**
 * Signals a deterministic consumer failure. RabbitMQ consumers acknowledge these
 * messages and do not retry them; the context handler should log the failure.
 */
export class NonRetryableMessageException extends Error {}
