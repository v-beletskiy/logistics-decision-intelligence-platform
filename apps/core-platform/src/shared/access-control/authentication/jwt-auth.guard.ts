import {
  type CanActivate,
  type ExecutionContext as NestExecutionContext,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import type { Identity } from "../identity/identity";
import { IdentityTokenVerifier } from "../jwt/identity-token-verifier";
import { AuthenticationException } from "./authentication.exception";
import { PUBLIC_ROUTE } from "./public-route.decorator";

export interface AuthenticatedHttpRequest {
  readonly headers: Readonly<Record<string, string | string[] | undefined>>;
  identity?: Identity;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly identityTokenVerifier: IdentityTokenVerifier,
  ) {}

  async canActivate(context: NestExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedHttpRequest>();
    const token = bearerToken(request.headers.authorization);
    request.identity = await this.identityTokenVerifier.verify(token);
    return true;
  }
}

function bearerToken(header: string | string[] | undefined): string {
  if (typeof header !== "string") throw new AuthenticationException();
  const match = /^Bearer ([^\s]+)$/.exec(header);
  if (match?.[1] === undefined) throw new AuthenticationException();
  return match[1];
}
