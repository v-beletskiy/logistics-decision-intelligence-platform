export abstract class ApplicationException extends Error {
  constructor(
    message: string,
    readonly code = "application.precondition-failed",
    readonly context?: Readonly<Record<string, unknown>>,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = new.target.name;
  }
}

export class AggregateNotFoundException extends ApplicationException {
  constructor(aggregateName: string, message?: string) {
    super(
      message ?? `${aggregateName} not found.`,
      "application.aggregate-not-found",
      { aggregateName },
    );
  }
}

export class ApplicationConflictException extends ApplicationException {
  constructor(
    message: string,
    code = "application.conflict",
    context?: Readonly<Record<string, unknown>>,
    options?: ErrorOptions,
  ) {
    super(message, code, context, options);
  }
}

export class ApplicationInputException extends ApplicationException {
  constructor(
    message: string,
    code = "application.precondition-failed",
    context?: Readonly<Record<string, unknown>>,
  ) {
    super(message, code, context);
  }
}

export class ConcurrencyConflictException extends ApplicationConflictException {
  constructor(message: string) {
    super(message, "application.concurrency-conflict");
  }
}

export class IdempotencyViolationException extends ApplicationConflictException {
  constructor(message: string) {
    super(message, "application.idempotency-conflict");
  }
}

/** Signals an impossible state assembled by application collaborators. */
export class ApplicationInvariantViolationException extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
  }
}
