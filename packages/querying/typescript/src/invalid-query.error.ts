/** Base for semantically invalid query inputs handled by querying utilities. */
export abstract class InvalidQueryError extends Error {
  protected constructor(
    message: string,
    readonly code: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = new.target.name;
  }
}
