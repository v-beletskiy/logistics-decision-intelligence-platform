import * as assert from "node:assert/strict";
import { test } from "node:test";

import type { ArgumentsHost } from "@nestjs/common";
import {
  InvalidQueryError,
  InvalidPaginationError,
  InvalidSortError,
} from "@logistics-decision-intelligence/querying";
import { SchemaValidationError } from "@logistics-decision-intelligence/validation/json-schema";

import { HttpExceptionFilter } from "./http-exception.filter";
import {
  AggregateNotFoundException,
  ApplicationConflictException,
  ApplicationInputException,
  ConcurrencyConflictException,
  IdempotencyViolationException,
} from "../../app/app.exceptions";
import {
  DomainConflictException,
  DomainException,
} from "../../domain/shared-kernel/domain.exceptions";

interface CapturedResponse {
  readonly statusCode: number;
  readonly body: unknown;
}

interface HttpRequestContext {
  readonly id: string;
  readonly url: string;
}

interface HttpResponseContext {
  header(name: string, value: string): void;
  status(statusCode: number): { send(body: unknown): void };
}

function createHost(): {
  host: ArgumentsHost;
  response: CapturedResponse;
} {
  let captured: CapturedResponse | undefined;

  const response: HttpResponseContext = {
    header() {},
    status(statusCode: number) {
      return {
        send(body: unknown) {
          captured = { statusCode, body };
        },
      };
    },
  };
  const request: HttpRequestContext = { id: "req-1", url: "/vehicles" };

  return {
    response: {
      get statusCode(): number {
        if (!captured) throw new Error("No response captured.");
        return captured.statusCode;
      },
      get body(): unknown {
        if (!captured) throw new Error("No response captured.");
        return captured.body;
      },
    },
    host: {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as ArgumentsHost,
  };
}

function run(exception: unknown): CapturedResponse {
  const { host, response } = createHost();
  new HttpExceptionFilter().catch(exception, host);
  return response;
}

test("maps AggregateNotFoundException to 404", () => {
  const result = run(new AggregateNotFoundException("Vehicle"));

  assert.equal(result.statusCode, 404);
});

test("maps ConcurrencyConflictException to 409", () => {
  const result = run(new ConcurrencyConflictException("Version conflict."));

  assert.equal(result.statusCode, 409);
  assert.equal(
    (result.body as { type: string }).type,
    "urn:problem:logistics:application.concurrency-conflict",
  );
  assert.equal(
    (result.body as { title: string }).title,
    "Request conflicts with current resource state.",
  );
  assert.equal((result.body as { detail: string }).detail, "Version conflict.");
});

test("maps IdempotencyViolationException to 409", () => {
  const result = run(new IdempotencyViolationException("Duplicate command."));

  assert.equal(result.statusCode, 409);
  assert.equal((result.body as { detail: string }).detail, "Duplicate command.");
});

test("maps an application input failure to 422", () => {
  const result = run(
    new ApplicationInputException("Use case precondition failed."),
  );

  assert.equal(result.statusCode, 422);
  assert.equal(
    (result.body as { title: string }).title,
    "Request cannot be processed.",
  );
  assert.equal(
    (result.body as { detail: string }).detail,
    "Use case precondition failed.",
  );
});

test("maps a deterministic application conflict to 409", () => {
  const result = run(
    new ApplicationConflictException(
      "A driver with this license number already exists.",
      "driver.license-number-conflict",
    ),
  );

  assert.equal(result.statusCode, 409);
  assert.equal(
    (result.body as { type: string }).type,
    "urn:problem:logistics:driver.license-number-conflict",
  );
  assert.equal(
    (result.body as { detail: string }).detail,
    "A driver with this license number already exists.",
  );
});

test("maps InvalidPaginationError to 422", () => {
  const result = run(new InvalidPaginationError("Cursor is invalid."));

  assert.equal(result.statusCode, 422);
  assert.equal(
    (result.body as { type: string }).type,
    "urn:problem:logistics:query.pagination-invalid",
  );
  assert.equal((result.body as { detail: string }).detail, "Cursor is invalid.");
});

test("maps InvalidSortError to 422", () => {
  const result = run(new InvalidSortError("Sort is invalid."));

  assert.equal(result.statusCode, 422);
  assert.equal(
    (result.body as { type: string }).type,
    "urn:problem:logistics:query.sort-invalid",
  );
});

test("query errors expose their source-owned category", () => {
  assert.ok(new InvalidPaginationError("Invalid.") instanceof InvalidQueryError);
  assert.ok(new InvalidSortError("Invalid.") instanceof InvalidQueryError);
});

test("maps a domain conflict by semantic category rather than code", () => {
  const result = run(
    new DomainConflictException(
      "The aggregate is already in that state.",
      "test.already-in-state",
    ),
  );

  assert.equal(result.statusCode, 409);
  assert.equal(
    (result.body as { type: string }).type,
    "urn:problem:logistics:test.already-in-state",
  );
  assert.equal(
    (result.body as { detail: string }).detail,
    "The aggregate is already in that state.",
  );
});

test("maps a generic domain rule violation to 422", () => {
  const result = run(new DomainException("A business value is invalid."));

  assert.equal(result.statusCode, 422);
  assert.equal(
    (result.body as { title: string }).title,
    "Business rule violation.",
  );
  assert.equal(
    (result.body as { detail: string }).detail,
    "A business value is invalid.",
  );
});

test("maps an unknown error to 500", () => {
  const result = run(new Error("boom"));

  assert.equal(result.statusCode, 500);
});

test("maps Ajv schema failures to a lean RFC 9457 validation problem", () => {
  const result = run(
    new SchemaValidationError("schema", [
      {
        code: "REQUIRED",
        keyword: "required",
        pointer: "/firstName",
        message: "must have required property 'firstName'",
      },
    ]),
  );

  assert.equal(result.statusCode, 400);
  assert.deepEqual(result.body, {
    type: "urn:problem:logistics:request.validation",
    title: "Request validation failed.",
    status: 400,
    instance: "urn:request:req-1",
    detail: undefined,
    errors: [
      {
        pointer: "/firstName",
        code: "required",
        message: "must have required property 'firstName'",
      },
    ],
  });
});
