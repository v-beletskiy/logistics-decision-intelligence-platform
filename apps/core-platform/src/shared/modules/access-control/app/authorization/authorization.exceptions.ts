export class AuthorizationException extends Error {
  constructor(
    message: string,
    readonly code = "authorization.denied",
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class AuthorizationDeniedException extends AuthorizationException {}
