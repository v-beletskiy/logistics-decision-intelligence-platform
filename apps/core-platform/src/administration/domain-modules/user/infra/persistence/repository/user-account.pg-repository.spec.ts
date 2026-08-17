import * as assert from "node:assert/strict";
import { test } from "node:test";

import { Role } from "../../../../../../shared/access-control/roles/role.enum";
import type { PgDatabase } from "../../../../../../shared/infra/persistence/pg-database";
import { UserEmailConflictException } from "../../../../../app/user/user.exceptions";
import { UserAccount } from "../../../domain/user-account";
import { PgUserAccountRepository } from "./user-account.pg-repository";

test("add translates the email constraint race into an application conflict", async () => {
  const pgError = {
    code: "23505",
    constraint: "users_email_unique",
  };
  const database = {
    exec: () => Promise.reject(pgError),
  } as unknown as PgDatabase;
  const account = UserAccount.reconstitute({
    id: "00000000-0000-4000-8000-000000000001",
    tenantId: "00000000-0000-4000-8000-000000000010",
    email: "admin@example.com",
    passwordHash: "password-hash",
    roles: [Role.Administrator],
    active: true,
  });

  await assert.rejects(
    new PgUserAccountRepository(database).add(account),
    (error: unknown) => {
      assert.ok(error instanceof UserEmailConflictException);
      assert.equal(error.code, "user.email-conflict");
      assert.equal(error.cause, pgError);
      return true;
    },
  );
});

test("add propagates unrelated PostgreSQL errors unchanged", async () => {
  const pgError = {
    code: "23503",
    constraint: "users_tenant_id_foreign_key",
  };
  const database = {
    exec: () => Promise.reject(pgError),
  } as unknown as PgDatabase;
  const account = UserAccount.reconstitute({
    id: "00000000-0000-4000-8000-000000000001",
    tenantId: "00000000-0000-4000-8000-000000000010",
    email: "admin@example.com",
    passwordHash: "password-hash",
    roles: [Role.Administrator],
    active: true,
  });

  await assert.rejects(
    new PgUserAccountRepository(database).add(account),
    (error: unknown) => error === pgError,
  );
});
