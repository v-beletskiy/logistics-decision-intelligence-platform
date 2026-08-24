import { Injectable } from "@nestjs/common";

import { InvalidCredentialsException } from "../../../../../../../shared/modules/access-control/app/authentication/authentication.exceptions.js";
import { IdentityType } from "../../../../../../../shared/modules/access-control/app/identity/identity-type.enum.js";
import {
  AccessTokenIssuer,
  type IssuedAccessToken,
} from "../../../../../../../shared/modules/access-control/app/authentication/access-token-issuer.js";
import { UserAccountRepository } from "../../../../user/domain/user-account.repository.js";
import { UserEmail } from "../../../../user/domain/user-email.value-object.js";
import { AuthenticateLocalUserCommand } from "./authenticate-local-user.command.js";
import { PasswordHasher } from "../../password-hasher.js";

const DUMMY_PASSWORD_HASH =
  "$argon2id$v=19$m=19456,p=1,t=2$1t74JGDiQD5fekAc/fTV4w$7xXgbqigOxclvkIDvYEnQG2Jl5dx2xYAD11SixLq3zU";

@Injectable()
export class AuthenticateLocalUserHandler {
  constructor(
    private readonly users: UserAccountRepository,
    private readonly passwords: PasswordHasher,
    private readonly tokens: AccessTokenIssuer,
  ) {}

  async exec(
    command: AuthenticateLocalUserCommand,
  ): Promise<IssuedAccessToken> {
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
