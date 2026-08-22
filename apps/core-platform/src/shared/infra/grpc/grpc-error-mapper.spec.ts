import * as assert from "node:assert/strict";
import { test } from "node:test";

import { status } from "@grpc/grpc-js";
import { InvalidPaginationError } from "@logistics-decision-intelligence/querying";
import { SchemaValidationError } from "@logistics-decision-intelligence/validation/json-schema";

import { AuthorizationDeniedException } from "../../modules/access-control/app/authorization/authorization.exceptions";
import { AuthenticationException } from "../../modules/access-control/app/authentication/authentication.exceptions";
import {
  AggregateNotFoundException,
  ApplicationConflictException,
  ApplicationInputException,
  ConcurrencyConflictException,
} from "../../app/app.exceptions";
import {
  defineErrorCodes,
  DomainConflictException,
  DomainException,
} from "../../domain/domain.exceptions";
import { toGrpcStatus } from "./grpc-error-mapper";

const TEST_DOMAIN_ERROR_CODES = defineErrorCodes("test", {
  stateConflict: "state-conflict",
  ruleViolation: "rule-violation",
});

test("toGrpcStatus maps AggregateNotFoundException to NOT_FOUND", () => {
  const mapped = toGrpcStatus(new AggregateNotFoundException("Route"));
  assert.deepEqual(mapped, {
    code: status.NOT_FOUND,
    details: "Route not found.",
  });
});

test("toGrpcStatus maps application conflicts to FAILED_PRECONDITION", () => {
  assert.equal(
    toGrpcStatus(new ApplicationConflictException("conflict")).code,
    status.FAILED_PRECONDITION,
  );
  assert.equal(
    toGrpcStatus(new ConcurrencyConflictException("concurrency")).code,
    status.FAILED_PRECONDITION,
  );
});

test("toGrpcStatus maps application input errors to INVALID_ARGUMENT", () => {
  assert.equal(
    toGrpcStatus(new ApplicationInputException("invalid")).code,
    status.INVALID_ARGUMENT,
  );
});

test("toGrpcStatus maps domain conflicts to FAILED_PRECONDITION", () => {
  assert.equal(
    toGrpcStatus(
      new DomainConflictException(
        "state conflict",
        TEST_DOMAIN_ERROR_CODES.stateConflict,
      ),
    ).code,
    status.FAILED_PRECONDITION,
  );
});

test("toGrpcStatus maps domain exceptions to INVALID_ARGUMENT", () => {
  assert.equal(
    toGrpcStatus(
      new DomainException(
        "rule violation",
        TEST_DOMAIN_ERROR_CODES.ruleViolation,
      ),
    ).code,
    status.INVALID_ARGUMENT,
  );
});

test("toGrpcStatus maps authentication to UNAUTHENTICATED", () => {
  assert.equal(
    toGrpcStatus(new AuthenticationException("unauthorized")).code,
    status.UNAUTHENTICATED,
  );
});

test("toGrpcStatus maps authorization denial to PERMISSION_DENIED", () => {
  assert.equal(
    toGrpcStatus(new AuthorizationDeniedException("denied")).code,
    status.PERMISSION_DENIED,
  );
});

test("toGrpcStatus maps schema validation errors to INVALID_ARGUMENT", () => {
  assert.equal(
    toGrpcStatus(new SchemaValidationError("schema-id", [])).code,
    status.INVALID_ARGUMENT,
  );
});

test("toGrpcStatus maps invalid query errors to INVALID_ARGUMENT", () => {
  assert.equal(
    toGrpcStatus(new InvalidPaginationError("page out of range")).code,
    status.INVALID_ARGUMENT,
  );
});

test("toGrpcStatus maps unknown errors to INTERNAL", () => {
  assert.equal(toGrpcStatus(new Error("boom")).code, status.INTERNAL);
  assert.equal(toGrpcStatus("not-an-error").code, status.INTERNAL);
});
