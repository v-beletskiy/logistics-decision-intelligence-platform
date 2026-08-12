import {
  ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import {
  InvalidPaginationError,
  InvalidSortError,
} from "@logistics-decision-intelligence/querying";
import { DomainException } from "../../domain/shared-kernel/exceptions/domain.exception";
import { AuthorizationDeniedException } from "../../access-control/authorization/authorization.exceptions";
import { AggregateNotFoundException } from "../../app/exceptions/aggregate-not-found.exception";
import { ApplicationException } from "../../app/exceptions/application.exception";
import { ConcurrencyConflictException } from "../../app/exceptions/concurrency-conflict.exception";
import { IdempotencyViolationException } from "../../app/exceptions/idempotency-violation.exception";

interface ErrorResponse {
  readonly statusCode: number;
  readonly message: string | readonly string[];
  readonly error?: string;
  readonly requestId?: string;
}

interface HttpRequestContext {
  readonly id?: string;
  readonly url: string;
}

interface HttpResponseContext {
  status(statusCode: number): {
    send(body: ErrorResponse): unknown;
  };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor() {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<HttpRequestContext>();
    const response = context.getResponse<HttpResponseContext>();
    const errorResponse = this.toErrorResponse(exception, request.id);

    if (errorResponse.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `Request: ${request.url}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    void response.status(errorResponse.statusCode).send(errorResponse);
  }

  private toErrorResponse(
    exception: unknown,
    requestId: string | undefined,
  ): ErrorResponse {
    if (exception instanceof AuthorizationDeniedException) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        message: "Forbidden resource.",
        error: "Forbidden",
        requestId,
      };
    }

    if (exception instanceof AggregateNotFoundException) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: exception.message,
        error: "Not Found",
        requestId,
      };
    }

    if (
      exception instanceof ConcurrencyConflictException ||
      exception instanceof IdempotencyViolationException
    ) {
      return {
        statusCode: HttpStatus.CONFLICT,
        message: exception.message,
        error: "Conflict",
        requestId,
      };
    }

    if (
      exception instanceof ApplicationException ||
      exception instanceof InvalidPaginationError ||
      exception instanceof InvalidSortError
    ) {
      return {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: exception.message,
        error: "Application Error",
        requestId,
      };
    }

    if (exception instanceof DomainException) {
      return {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: exception.message,
        error: "Business Rule Violation",
        requestId,
      };
    }

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const body =
        typeof response === "string"
          ? { message: response }
          : (response as {
              message?: string | readonly string[];
              error?: string;
            });
      return {
        statusCode: exception.getStatus(),
        message: body.message ?? exception.message,
        error: body.error,
        requestId,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error.",
      error: "Internal Server Error",
      requestId,
    };
  }
}
