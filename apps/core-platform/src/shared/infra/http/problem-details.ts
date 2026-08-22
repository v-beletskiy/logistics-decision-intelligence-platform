import { HttpStatus } from "@nestjs/common";
import type { ValidationIssue } from "@logistics-decision-intelligence/validation/json-schema";

export interface ProblemError {
  readonly pointer: string;
  readonly code: string;
  readonly message: string;
}

/** RFC 9457 problem representation. Layer errors are translated into this only at the HTTP boundary. */
export interface ProblemDetails {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly instance?: string;
  readonly detail?: string;
  readonly errors?: readonly ProblemError[];
}

interface ProblemOptions {
  readonly code: string;
  readonly title: string;
  readonly status: number;
  readonly requestId?: string;
  readonly detail?: string;
  readonly errors?: readonly ProblemError[];
}

export function problem(options: ProblemOptions): ProblemDetails {
  return {
    type: `urn:problem:logistics:${options.code}`,
    title: options.title,
    status: options.status,
    instance:
      options.requestId === undefined
        ? undefined
        : `urn:request:${options.requestId}`,
    detail: options.detail,
    errors: options.errors,
  };
}

export function composeValidationProblem(
  issues: readonly ValidationIssue[],
  requestId?: string,
): ProblemDetails {
  return problem({
    code: "request.validation",
    title: "Request validation failed.",
    status: HttpStatus.BAD_REQUEST,
    requestId,
    errors: issues.map(({ pointer, code, message }) => ({
      pointer,
      code: code.toLowerCase().replaceAll("_", "-"),
      message,
    })),
  });
}
