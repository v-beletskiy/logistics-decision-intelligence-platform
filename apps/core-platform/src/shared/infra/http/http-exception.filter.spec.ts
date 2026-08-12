import * as assert from "node:assert/strict";
import { test } from "node:test";

import type { ArgumentsHost } from "@nestjs/common";
import {
  InvalidPaginationError,
  InvalidSortError,
} from "@logistics-decision-intelligence/querying";

import { HttpExceptionFilter } from "./http-exception.filter";
import { AggregateNotFoundException } from "../../app/exceptions/aggregate-not-found.exception";
import { ApplicationException } from "../../app/exceptions/application.exception";
import { ConcurrencyConflictException } from "../../app/exceptions/concurrency-conflict.exception";
import { IdempotencyViolationException } from "../../app/exceptions/idempotency-violation.exception";

interface CapturedResponse {
  readonly statusCode: number;
  readonly body: unknown;
}

interface HttpRequestContext {
  readonly id: string;
  readonly url: string;
}

interface HttpResponseContext {
  status(statusCode: number): { send(body: unknown): void };
}

function createHost(): {
  host: ArgumentsHost;
  response: CapturedResponse;
} {
  let captured: CapturedResponse | undefined;

  const response: HttpResponseContext = {
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
  assert.equal((result.body as { message: string }).message, "Version conflict.");
});

test("maps IdempotencyViolationException to 409", () => {
  const result = run(new IdempotencyViolationException("Duplicate command."));

  assert.equal(result.statusCode, 409);
  assert.equal((result.body as { message: string }).message, "Duplicate command.");
});

test("maps a bare ApplicationException to 422", () => {
  const result = run(new ApplicationException("Use case precondition failed."));

  assert.equal(result.statusCode, 422);
});

test("maps InvalidPaginationError to 422", () => {
  const result = run(new InvalidPaginationError("Cursor is invalid."));

  assert.equal(result.statusCode, 422);
});

test("maps InvalidSortError to 422", () => {
  const result = run(new InvalidSortError("Sort is invalid."));

  assert.equal(result.statusCode, 422);
});

test("maps an unknown error to 500", () => {
  const result = run(new Error("boom"));

  assert.equal(result.statusCode, 500);
});
