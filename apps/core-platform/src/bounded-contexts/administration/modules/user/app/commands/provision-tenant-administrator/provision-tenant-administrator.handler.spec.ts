import * as assert from "node:assert/strict";
import { test } from "node:test";

import { Role } from "../../../../../../../shared/modules/access-control/domain/role.js";
import { ApplicationInputException } from "../../../../../../../shared/app/app.exceptions.js";
import { UserAccount } from "../../../domain/user-account.js";
import { UserAccountRepository } from "../../../domain/user-account.repository.js";
import { PasswordHasher } from "../../../../authentication/app/password-hasher.js";
import { ProvisionTenantAdministratorCommand } from "./provision-tenant-administrator.command.js";
import { ProvisionTenantAdministratorHandler } from "./provision-tenant-administrator.handler.js";
import { UserEmailConflictException } from "../../user.exceptions.js";

class FakeUsers extends UserAccountRepository {
  constructor(private readonly existingAccount: UserAccount | null) {
    super();
  }

  findByEmail(): Promise<UserAccount | null> {
    return Promise.resolve(this.existingAccount);
  }

  add(): Promise<void> {
    return Promise.resolve();
  }
}

class FakePasswords extends PasswordHasher {
  hash(): Promise<string> {
    return Promise.resolve("password-hash");
  }

  verify(): Promise<boolean> {
    return Promise.resolve(false);
  }
}

const tenantId = "00000000-0000-4000-8000-000000000010";
const existingAccount = UserAccount.reconstitute({
  id: "00000000-0000-4000-8000-000000000001",
  tenantId,
  email: "admin@example.com",
  passwordHash: "password-hash",
  roles: [Role.Administrator],
  active: true,
});

test("existing administrator email is an application conflict", async () => {
  const handler = new ProvisionTenantAdministratorHandler(
    new FakeUsers(existingAccount),
    new FakePasswords(),
  );

  await assert.rejects(
    handler.exec(
      new ProvisionTenantAdministratorCommand(
        tenantId,
        " ADMIN@example.com ",
        "a-secure-password",
      ),
    ),
    (error: unknown) =>
      error instanceof UserEmailConflictException &&
      error.code === "user.email-conflict",
  );
});

test("invalid administrator password is an application input failure", async () => {
  const handler = new ProvisionTenantAdministratorHandler(
    new FakeUsers(null),
    new FakePasswords(),
  );

  await assert.rejects(
    handler.exec(
      new ProvisionTenantAdministratorCommand(
        tenantId,
        "admin@example.com",
        "short",
      ),
    ),
    (error: unknown) =>
      error instanceof ApplicationInputException &&
      error.code === "user.password-length-invalid",
  );
});
