import {
  ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { SchemaValidationError } from "@logistics-decision-intelligence/validation/json-schema";
import { InvalidQueryError } from "@logistics-decision-intelligence/querying";
import {
  DomainConflictException,
  DomainException,
} from "../../domain/domain.exceptions.js";
import { AuthorizationDeniedException } from "../../modules/access-control/app/authorization/authorization.exceptions.js";
import {
  AggregateNotFoundException,
  ApplicationConflictException,
  ApplicationInputException,
} from "../../app/app.exceptions.js";
import {
  AuthenticationException,
  InvalidCredentialsException,
} from "../../modules/access-control/app/authentication/authentication.exceptions.js";
import {
  problem,
  type ProblemDetails,
  composeValidationProblem,
} from "./problem-details.js";

interface HttpRequestContext {
  readonly id?: string;
  readonly url: string;
}

interface HttpResponseContext {
  header(name: string, value: string): unknown;
  status(statusCode: number): {
    send(body: ProblemDetails): unknown;
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
    const errorResponse = this.toProblemDetails(exception, request.id);

    if (errorResponse.status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `Request: ${request.url}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.header("content-type", "application/problem+json");
    if (request.id !== undefined) response.header("x-request-id", request.id);
    if (errorResponse.status === HttpStatus.UNAUTHORIZED) {
      response.header("www-authenticate", "Bearer");
    }
    void response.status(errorResponse.status).send(errorResponse);
  }

  private toProblemDetails(
    exception: unknown,
    requestId: string | undefined,
  ): ProblemDetails {
    if (exception instanceof SchemaValidationError) {
      return composeValidationProblem(exception.issues, requestId);
    }

    if (exception instanceof AuthenticationException) {
      return problem({
        code: exception.code,
        title:
          exception instanceof InvalidCredentialsException
            ? "Authentication failed."
            : "Authentication is required.",
        status: HttpStatus.UNAUTHORIZED,
        requestId,
      });
    }

    if (exception instanceof AuthorizationDeniedException) {
      return problem({
        code: exception.code,
        title: "Access is denied.",
        status: HttpStatus.FORBIDDEN,
        requestId,
      });
    }

    if (exception instanceof AggregateNotFoundException) {
      return problem({
        code: exception.code,
        title: "Resource not found.",
        detail: exception.message,
        status: HttpStatus.NOT_FOUND,
        requestId,
      });
    }

    if (exception instanceof ApplicationConflictException) {
      return problem({
        code: exception.code,
        title: "Request conflicts with current resource state.",
        detail: exception.message,
        status: HttpStatus.CONFLICT,
        requestId,
      });
    }

    if (exception instanceof ApplicationInputException) {
      return problem({
        code: exception.code,
        title: "Request cannot be processed.",
        detail: exception.message,
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        requestId,
      });
    }

    if (exception instanceof InvalidQueryError) {
      return problem({
        code: exception.code,
        title: "Query is invalid.",
        detail: exception.message,
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        requestId,
      });
    }

    if (exception instanceof DomainConflictException) {
      return problem({
        code: exception.code,
        title: "Request conflicts with current resource state.",
        detail: exception.message,
        status: HttpStatus.CONFLICT,
        requestId,
      });
    }

    if (exception instanceof DomainException) {
      return problem({
        code: exception.code,
        title: "Business rule violation.",
        detail: exception.message,
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        requestId,
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      return problem({
        code: `http.${status}`,
        title:
          status >= HttpStatus.INTERNAL_SERVER_ERROR
            ? "Service unavailable."
            : exception.message,
        status,
        requestId,
      });
    }

    return problem({
      code: "http.internal-error",
      title: "Internal server error.",
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      requestId,
    });
  }
}
