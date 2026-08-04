/**
 * Base class for failures caused by a violated business rule.
 *
 * It deliberately carries no transport or persistence concern, so domain code
 * can express a business failure without depending on NestJS.
 */
export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
