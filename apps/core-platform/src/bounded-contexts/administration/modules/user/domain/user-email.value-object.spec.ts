import * as assert from "node:assert/strict";
import { test } from "node:test";

import { DomainException } from "../../../../../shared/domain/domain.exceptions";

import { UserEmail } from "./user-email.value-object";

test("canonicalizes a local authentication email address", () => {
  const email = UserEmail.create(" Planner@Example.COM ");

  assert.equal(email.value, "planner@example.com");
  assert.ok(email.equals(UserEmail.create("planner@example.com")));
});

test("rejects an invalid user email with an architecture-owned code", () => {
  assert.throws(
    () => UserEmail.create("not-an-email"),
    (error: unknown) =>
      error instanceof DomainException && error.code === "user.email-invalid",
  );
});
