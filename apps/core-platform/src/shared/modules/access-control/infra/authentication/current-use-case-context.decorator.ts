import { createParamDecorator } from "@nestjs/common";

import { UseCaseContext } from "../../app/execution/use-case-context.js";
import { AuthenticationException } from "../../app/authentication/authentication.exceptions.js";
import type { AuthenticatedHttpRequest } from "./jwt-auth.guard.js";

export const CurrentUseCaseContext = createParamDecorator(
  (_data: unknown, context): UseCaseContext => {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedHttpRequest>();
    if (request.identity === undefined) throw new AuthenticationException();
    return UseCaseContext.fromIdentity(request.identity);
  },
);
