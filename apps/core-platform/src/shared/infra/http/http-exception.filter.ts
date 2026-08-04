import {
  ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { AuthorizationDeniedException } from "../../access-control/authorization/authorization.exceptions";

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
