export class AuthenticateLocalUserCommand {
  constructor(
    readonly email: string,
    readonly password: string,
  ) {}
}
