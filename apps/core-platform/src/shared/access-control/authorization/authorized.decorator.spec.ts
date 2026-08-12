import * as assert from "node:assert/strict";
import { test } from "node:test";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import {
  AccessManager,
  type AuthorizationContext,
} from "./access-manager";
import { AuthorizationDeniedException } from "./authorization.exceptions";
import { Authorized } from "./authorized.decorator";
import {
  ExecutionContext,
  type ExecutionRequest,
} from "../../app/execution/execution-context";
import { IdentityType } from "../identity/identity-type.enum";
import type { Identity } from "../identity/identity";
import { Permission } from "../permissions/permission.enum";

class FakeAccessManager {
  authorize(
    _identity: Identity,
    _permission: Permission,
    _context?: AuthorizationContext,
  ): Promise<void> {
    return Promise.resolve();
  }
}

class AuthorizedHandler {
  @Authorized(Permission.VehicleManage)
  async execute(_request: ExecutionRequest<void>): Promise<string> {
    return "executed";
  }
}

const identity: Identity = {
  id: "user-1",
  tenantId: "00000000-0000-4000-8000-000000000010",
  type: IdentityType.User,
  roles: [],
};

function request(): ExecutionRequest<void> {
  return { context: ExecutionContext.fromIdentity(identity), input: undefined };
}

function handlerWith(access: FakeAccessManager): AuthorizedHandler {
  const handler = new AuthorizedHandler();
  const injectedProperty = Object.getOwnPropertySymbols(
    AuthorizedHandler.prototype,
  ).find((property) => property.description === "authorizedAccessManager");
  assert.ok(injectedProperty);
  Reflect.set(handler, injectedProperty, access);
  return handler;
}

test("authorizes through AccessManager injected into the wrapper", async () => {
  const access = new FakeAccessManager();
  let authorizedIdentity: Identity | undefined;
  let authorizedPermission: Permission | undefined;
  let authorizedContext: AuthorizationContext | undefined;
  access.authorize = async (i, p, context) => {
    authorizedIdentity = i;
    authorizedPermission = p;
    authorizedContext = context;
  };
  @Module({
    providers: [
      AuthorizedHandler,
      { provide: AccessManager, useValue: access },
    ],
  })
  class TestModule {}

  const app = await NestFactory.createApplicationContext(TestModule, {
    logger: false,
  });
  try {
    await app.get(AuthorizedHandler).execute(request());
  } finally {
    await app.close();
  }

  assert.equal(authorizedIdentity, identity);
  assert.equal(authorizedPermission, Permission.VehicleManage);
  assert.deepEqual(authorizedContext, { tenantId: identity.tenantId });
});

test("executes the original method when authorization succeeds", async () => {
  const handler = handlerWith(new FakeAccessManager());

  const result = await handler.execute(request());

  assert.equal(result, "executed");
});

test("does not execute the original method when authorization is denied", async () => {
  const access = new FakeAccessManager();
  access.authorize = async () => {
    throw new AuthorizationDeniedException("Denied.");
  };
  const handler = handlerWith(access);

  await assert.rejects(
    () => handler.execute(request()),
    AuthorizationDeniedException,
  );
});
