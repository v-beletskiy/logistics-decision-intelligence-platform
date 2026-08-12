import * as assert from "node:assert/strict";
import { test } from "node:test";

import { AuthorizationDeniedException } from "../../access-control/authorization/authorization.exceptions";
import { IdentityType } from "../../access-control/identity/identity-type.enum";
import { ExecutionContext } from "./execution-context";

test("ExecutionContext derives its tenant scope from the authenticated identity", () => {
  const identity = {
    id: "user-1",
    tenantId: "00000000-0000-4000-8000-000000000010",
    type: IdentityType.User,
    roles: [],
  } as const;

  const context = ExecutionContext.fromIdentity(identity);

  assert.equal(context.identity, identity);
  assert.equal(context.tenantId, identity.tenantId);
});

test("ExecutionContext rejects identities without a tenant scope", () => {
  assert.throws(
    () =>
      ExecutionContext.fromIdentity({
        id: "service-1",
        type: IdentityType.Service,
        scopes: [],
      }),
    AuthorizationDeniedException,
  );
});
