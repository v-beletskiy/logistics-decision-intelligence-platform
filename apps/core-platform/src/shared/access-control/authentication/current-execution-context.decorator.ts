import { createParamDecorator } from "@nestjs/common";

import { ExecutionContext } from "../../app/execution/execution-context";
import type { AuthenticatedHttpRequest } from "./jwt-auth.guard";
import { AuthenticationException } from "./authentication.exception";

export const CurrentExecutionContext = createParamDecorator(
  (_data: unknown, context): ExecutionContext => {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedHttpRequest>();
    if (request.identity === undefined) throw new AuthenticationException();
    return ExecutionContext.fromIdentity(request.identity);
  },
);
