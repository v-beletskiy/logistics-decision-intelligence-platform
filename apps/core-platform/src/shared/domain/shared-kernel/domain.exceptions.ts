/**
 * Base class for failures caused by a violated business rule.
 *
 * It deliberately carries no transport or persistence concern, so domain code
 * can express a business failure without depending on NestJS.
 */
export class DomainException extends Error {
  constructor(
    message: string,
    readonly code = "domain.rule-violation",
    readonly context?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

/** A business rule failure caused by the aggregate's current state. */
export class DomainConflictException extends DomainException {
  constructor(
    message: string,
    code = "domain.state-conflict",
    context?: Readonly<Record<string, unknown>>,
  ) {
    super(message, code, context);
  }
}
