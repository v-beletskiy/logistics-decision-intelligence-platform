import * as assert from "node:assert/strict";
import { test } from "node:test";

import { Role } from "../../../../../../../../shared/modules/access-control/domain/role";
import type { IFindUserAccountByEmailResult } from "../queries/user.find-by-email.queries";

import { UserAccountMapper } from "./user-account.mapper";

const userAccountRow: IFindUserAccountByEmailResult = {
  id: "00000000-0000-4000-8000-000000000001",
  tenant_id: "00000000-0000-4000-8000-000000000010",
  email: "planner@example.com",
  password_hash: "password-hash",
  roles: [Role.Planner],
  active: true,
};

test("UserAccountMapper reconstructs a User Account", () => {
  const account = UserAccountMapper.toDomain(userAccountRow);

  assert.equal(account.id, userAccountRow.id);
  assert.deepEqual(account.roles, [Role.Planner]);
});

test("UserAccountMapper translates invalid persisted role data", () => {
  assert.throws(
    () =>
      UserAccountMapper.toDomain({
        ...userAccountRow,
        roles: ["unknown-role"],
      }),
    /Persisted user account is malformed: Stored user roles are invalid/,
  );
});

test("UserAccountMapper maps a User Account for insertion", () => {
  const account = UserAccountMapper.toDomain(userAccountRow);

  assert.deepEqual(UserAccountMapper.toPersistence(account), {
    id: userAccountRow.id,
    tenantId: userAccountRow.tenant_id,
    email: userAccountRow.email,
    passwordHash: userAccountRow.password_hash,
    roles: [Role.Planner],
    active: true,
  });
});
