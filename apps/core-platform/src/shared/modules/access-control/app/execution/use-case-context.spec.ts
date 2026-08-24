import * as assert from "node:assert/strict";
import { test } from "node:test";

import { AuthorizationDeniedException } from "../authorization/authorization.exceptions.js";
import { IdentityType } from "../identity/identity-type.enum.js";
import { UseCaseContext } from "./use-case-context.js";

test("UseCaseContext derives its tenant scope from the authenticated identity", () => {
  const identity = {
    id: "user-1",
    tenantId: "00000000-0000-4000-8000-000000000010",
    type: IdentityType.User,
    roles: [],
  } as const;

  const context = UseCaseContext.fromIdentity(identity);

  assert.equal(context.identity, identity);
  assert.equal(context.tenantId, identity.tenantId);
});

test("UseCaseContext rejects identities without a tenant scope", () => {
  assert.throws(
    () =>
      UseCaseContext.fromIdentity({
        id: "service-1",
        type: IdentityType.Service,
        scopes: [],
      }),
    AuthorizationDeniedException,
  );
});
