import * as assert from "node:assert/strict";
import { test } from "node:test";

import { InvalidCredentialsException } from "../../../../../../../shared/modules/access-control/app/authentication/authentication.exceptions.js";
import type { UserIdentity } from "../../../../../../../shared/modules/access-control/app/identity/identity.js";
import type { IssuedAccessToken } from "../../../../../../../shared/modules/access-control/app/authentication/access-token-issuer.js";
import { AccessTokenIssuer } from "../../../../../../../shared/modules/access-control/app/authentication/access-token-issuer.js";
import { Role } from "../../../../../../../shared/modules/access-control/domain/role.js";
import { UserAccount } from "../../../../user/domain/user-account.js";
import { UserAccountRepository } from "../../../../user/domain/user-account.repository.js";
import { AuthenticateLocalUserCommand } from "./authenticate-local-user.command.js";
import { AuthenticateLocalUserHandler } from "./authenticate-local-user.handler.js";
import { PasswordHasher } from "../../password-hasher.js";

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
