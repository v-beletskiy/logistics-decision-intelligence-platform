import * as assert from "node:assert/strict";
import { test } from "node:test";

import { InvalidCredentialsException } from "../../../../../shared/access-control/authentication/authentication.exception";
import type { UserIdentity } from "../../../../../shared/access-control/identity/identity";
import type { IssuedAccessToken } from "../../../../../shared/access-control/jwt/access-token-issuer";
import { AccessTokenIssuer } from "../../../../../shared/access-control/jwt/access-token-issuer";
import { Role } from "../../../../../shared/access-control/roles/role.enum";
import { UserAccount } from "../../../../domain-modules/user/domain/user-account";
import { UserAccountRepository } from "../../../../domain-modules/user/domain/user-account.repository";
import { AuthenticateLocalUserCommand } from "./authenticate-local-user.command";
import { AuthenticateLocalUserHandler } from "./authenticate-local-user.handler";
import { PasswordHasher } from "../../password-hasher";

class FakeUsers extends UserAccountRepository {
  constructor(private readonly account: UserAccount | null) {
    super();
  }
  findByEmail(): Promise<UserAccount | null> {
    return Promise.resolve(this.account);
  }
  add(): Promise<void> {
    return Promise.resolve();
  }
}

class FakePasswords extends PasswordHasher {
  verifiedHash?: string;
  hash(): Promise<string> {
    return Promise.resolve("hash");
  }
  verify(hash: string, password: string): Promise<boolean> {
    this.verifiedHash = hash;
    return Promise.resolve(hash === "stored-hash" && password === "correct");
  }
}

class RecordingTokenIssuer extends AccessTokenIssuer {
  identity?: UserIdentity;
  issue(identity: UserIdentity): Promise<IssuedAccessToken> {
    this.identity = identity;
    return Promise.resolve({
      accessToken: "token",
      tokenType: "Bearer",
      expiresIn: 900,
    });
  }
}

const account = UserAccount.reconstitute({
  id: "00000000-0000-4000-8000-000000000001",
  tenantId: "00000000-0000-4000-8000-000000000010",
  email: "planner@example.com",
  passwordHash: "stored-hash",
  roles: [Role.Planner],
  active: true,
});

test("local authentication normalizes email and issues from trusted account facts", async () => {
  const tokens = new RecordingTokenIssuer();
  const handler = new AuthenticateLocalUserHandler(
    new FakeUsers(account),
    new FakePasswords(),
    tokens,
  );

  const result = await handler.exec(
    new AuthenticateLocalUserCommand(" Planner@Example.COM ", "correct"),
  );

  assert.equal(result.accessToken, "token");
  assert.equal(tokens.identity?.id, account.id);
  assert.equal(tokens.identity?.tenantId, account.tenantId);
  assert.deepEqual(tokens.identity?.roles, [Role.Planner]);
});

test("unknown email and wrong password expose the same failure", async () => {
  const missingPasswords = new FakePasswords();
  const missing = new AuthenticateLocalUserHandler(
    new FakeUsers(null),
    missingPasswords,
    new RecordingTokenIssuer(),
  );
  const wrong = new AuthenticateLocalUserHandler(
    new FakeUsers(account),
    new FakePasswords(),
    new RecordingTokenIssuer(),
  );

  await assert.rejects(
    missing.exec(new AuthenticateLocalUserCommand("none@example.com", "wrong")),
    InvalidCredentialsException,
  );
  await assert.rejects(
    wrong.exec(new AuthenticateLocalUserCommand(account.email, "wrong")),
    InvalidCredentialsException,
  );
  assert.notEqual(missingPasswords.verifiedHash, undefined);
});
