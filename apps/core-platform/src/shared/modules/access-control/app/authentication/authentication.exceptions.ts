export class AuthenticationException extends Error {
  constructor(
    message = "Authentication is required.",
    readonly code = "authentication.required",
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidCredentialsException extends AuthenticationException {
  constructor() {
    super("Invalid credentials.", "authentication.invalid-credentials");
  }
}
