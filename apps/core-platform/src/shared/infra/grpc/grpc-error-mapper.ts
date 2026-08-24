import { status, type StatusObject } from "@grpc/grpc-js";
import { InvalidQueryError } from "@logistics-decision-intelligence/querying";
import { SchemaValidationError } from "@logistics-decision-intelligence/validation/json-schema";

import { AuthorizationDeniedException } from "../../modules/access-control/app/authorization/authorization.exceptions.js";
import { AuthenticationException } from "../../modules/access-control/app/authentication/authentication.exceptions.js";
import {
  AggregateNotFoundException,
  ApplicationConflictException,
  ApplicationInputException,
} from "../../app/app.exceptions.js";
import {
  DomainConflictException,
  DomainException,
} from "../../domain/domain.exceptions.js";

/** Maps transport-agnostic exceptions to gRPC statuses at the transport boundary. */
export function toGrpcStatus(error: unknown): Partial<StatusObject> {
  if (error instanceof SchemaValidationError) {
    return { code: status.INVALID_ARGUMENT, details: error.message };
  }
  if (error instanceof InvalidQueryError) {
    return { code: status.INVALID_ARGUMENT, details: error.message };
  }
  if (error instanceof AuthenticationException) {
    return { code: status.UNAUTHENTICATED, details: error.message };
  }
  if (error instanceof AuthorizationDeniedException) {
    return { code: status.PERMISSION_DENIED, details: error.message };
  }
  if (error instanceof AggregateNotFoundException) {
    return { code: status.NOT_FOUND, details: error.message };
  }
  if (error instanceof ApplicationConflictException) {
    return { code: status.FAILED_PRECONDITION, details: error.message };
  }
  if (error instanceof ApplicationInputException) {
    return { code: status.INVALID_ARGUMENT, details: error.message };
  }
  if (error instanceof DomainConflictException) {
    return { code: status.FAILED_PRECONDITION, details: error.message };
  }
  if (error instanceof DomainException) {
    return { code: status.INVALID_ARGUMENT, details: error.message };
  }
  return { code: status.INTERNAL, details: "Internal server error." };
}
