import { Injectable } from "@nestjs/common";

import { InvalidCredentialsException } from "../../../../../shared/access-control/authentication/authentication.exception";
import { IdentityType } from "../../../../../shared/access-control/identity/identity-type.enum";
import {
  AccessTokenIssuer,
  type IssuedAccessToken,
} from "../../../../../shared/access-control/jwt/access-token-issuer";
import { UserAccountRepository } from "../../../../domain-modules/user/domain/user-account.repository";
import { UserEmail } from "../../../../domain-modules/user/domain/user-email.value-object";
import { AuthenticateLocalUserCommand } from "./authenticate-local-user.command";
import { PasswordHasher } from "../../password-hasher";

const DUMMY_PASSWORD_HASH =
  "$argon2id$v=19$m=19456,p=1,t=2$1t74JGDiQD5fekAc/fTV4w$7xXgbqigOxclvkIDvYEnQG2Jl5dx2xYAD11SixLq3zU";

@Injectable()
export class AuthenticateLocalUserHandler {
  constructor(
    private readonly users: UserAccountRepository,
    private readonly passwords: PasswordHasher,
    private readonly tokens: AccessTokenIssuer,
  ) {}

  async exec(command: AuthenticateLocalUserCommand): Promise<IssuedAccessToken> {
    const account = await this.users.findByEmail(
      UserEmail.create(command.email).value,
    );
    const passwordMatches = await this.passwords.verify(
      account?.passwordHash ?? DUMMY_PASSWORD_HASH,
      command.password,
    );
    if (account === null || !account.active || !passwordMatches) {
      throw new InvalidCredentialsException();
    }

    return this.tokens.issue({
      id: account.id,
      tenantId: account.tenantId,
      roles: account.roles,
      type: IdentityType.User,
    });
  }
}
