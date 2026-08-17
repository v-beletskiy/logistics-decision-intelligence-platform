import * as assert from "node:assert/strict";
import { test } from "node:test";

import { AuthorizationDeniedException } from "../authorization/authorization.exceptions";
import { IdentityType } from "../identity/identity-type.enum";
import { Permission } from "../permissions/permission.enum";
import { Role } from "../roles/role.enum";
import { ROLE_PERMISSIONS } from "../roles/role-permissions";
import { CaslAccessManager } from "./casl-access-manager";

const tenantId = "00000000-0000-4000-8000-000000000010";

test("Dispatcher receives its complete static RBAC grant", async () => {
  const access = new CaslAccessManager();
  const identity = {
    id: "user",
    tenantId,
    type: IdentityType.User as const,
    roles: [Role.Dispatcher],
  };

  for (const permission of ROLE_PERMISSIONS[Role.Dispatcher]) {
    await access.authorize(
      identity,
      permission,
      { tenantId },
    );
  }
});

test("Planner receives its complete static RBAC grant", async () => {
  const access = new CaslAccessManager();
  const identity = {
    id: "user",
    tenantId,
    type: IdentityType.User as const,
    roles: [Role.Planner],
  };

  for (const permission of ROLE_PERMISSIONS[Role.Planner]) {
    await access.authorize(identity, permission, { tenantId });
  }
});

test("Administrator has every static permission", async () => {
  const access = new CaslAccessManager();
  const identity = {
    id: "user",
    tenantId,
    type: IdentityType.User as const,
    roles: [Role.Administrator],
  };
  for (const permission of Object.values(Permission)) {
    await access.authorize(identity, permission, { tenantId });
  }
});

test("authorization is deny-by-default for absent permission or another tenant", async () => {
  const access = new CaslAccessManager();
  const dispatcher = {
    id: "user",
    tenantId,
    type: IdentityType.User as const,
    roles: [Role.Dispatcher],
  };
  const planner = {
    id: "user",
    tenantId,
    type: IdentityType.User as const,
    roles: [Role.Planner],
  };

  await assert.rejects(
    access.authorize(dispatcher, Permission.OptimizationExecute, { tenantId }),
    AuthorizationDeniedException,
  );
  await assert.rejects(
    access.authorize(planner, Permission.RecommendationAccept, { tenantId }),
    AuthorizationDeniedException,
  );
  await assert.rejects(
    access.authorize(dispatcher, Permission.DriverRead, {
      tenantId: "00000000-0000-4000-8000-000000000011",
    }),
    AuthorizationDeniedException,
  );
});
