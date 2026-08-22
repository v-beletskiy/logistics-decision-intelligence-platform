import * as assert from "node:assert/strict";
import { test } from "node:test";

import { Role } from "../../../../../shared/modules/access-control/domain/role";

import { UserAccount } from "./user-account";

const props = {
  id: "00000000-0000-4000-8000-000000000001",
  tenantId: "00000000-0000-4000-8000-000000000010",
  email: "admin@example.com",
  passwordHash: "password-hash",
  active: true,
};

test("owns a defensive copy of user roles", () => {
  const suppliedRoles: Role[] = [Role.Administrator];
  const account = UserAccount.reconstitute({ ...props, roles: suppliedRoles });

  suppliedRoles.push(Role.Planner);
  const exposedRoles = account.roles as Role[];
  exposedRoles.push(Role.Planner);

  assert.deepEqual(account.roles, [Role.Administrator]);
});
