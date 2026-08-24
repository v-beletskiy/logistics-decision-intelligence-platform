import * as assert from "node:assert/strict";
import { test } from "node:test";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AccessManager, type AuthorizationContext } from "./access-manager.js";
import { AuthorizationDeniedException } from "./authorization.exceptions.js";
import { Authorized } from "./authorized.decorator.js";
import {
  UseCaseContext,
  type UseCaseRequest,
} from "../execution/use-case-context.js";
import { IdentityType } from "../identity/identity-type.enum.js";
import type { Identity } from "../identity/identity.js";
import { Permission } from "../permissions/permission.enum.js";

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
  async exec(_request: UseCaseRequest<void>): Promise<string> {
    return "executed";
  }
}

const identity: Identity = {
  id: "user-1",
  tenantId: "00000000-0000-4000-8000-000000000010",
  type: IdentityType.User,
  roles: [],
};

function request(): UseCaseRequest<void> {
  return { context: UseCaseContext.fromIdentity(identity), input: undefined };
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
    await app.get(AuthorizedHandler).exec(request());
  } finally {
    await app.close();
  }

  assert.equal(authorizedIdentity, identity);
  assert.equal(authorizedPermission, Permission.VehicleManage);
  assert.deepEqual(authorizedContext, { tenantId: identity.tenantId });
});

test("executes the original method when authorization succeeds", async () => {
  const handler = handlerWith(new FakeAccessManager());

  const result = await handler.exec(request());

  assert.equal(result, "executed");
});

test("does not exec the original method when authorization is denied", async () => {
  const access = new FakeAccessManager();
  access.authorize = async () => {
    throw new AuthorizationDeniedException("Denied.");
  };
  const handler = handlerWith(access);

  await assert.rejects(
    () => handler.exec(request()),
    AuthorizationDeniedException,
  );
});
