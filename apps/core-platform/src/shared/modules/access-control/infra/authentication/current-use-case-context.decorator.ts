import { createParamDecorator } from "@nestjs/common";

import { UseCaseContext } from "../../app/execution/use-case-context";
import { AuthenticationException } from "../../app/authentication/authentication.exceptions";
import type { AuthenticatedHttpRequest } from "./jwt-auth.guard";

export const CurrentUseCaseContext = createParamDecorator(
  (_data: unknown, context): UseCaseContext => {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedHttpRequest>();
    if (request.identity === undefined) throw new AuthenticationException();
    return UseCaseContext.fromIdentity(request.identity);
  },
);
