import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";

import { PublicRoute } from "../../../../../../shared/modules/access-control/infra/authentication/public-route.decorator.js";
import { AuthenticateLocalUserCommand } from "../../app/commands/authenticate-local-user/authenticate-local-user.command.js";
import { AuthenticateLocalUserHandler } from "../../app/commands/authenticate-local-user/authenticate-local-user.handler.js";
import type {
  AccessTokenResponse,
  LoginRequest,
} from "./authentication.http-contracts.js";
import { AuthenticationHttpMapper } from "./authentication.http-mapper.js";
import { loginRequestPipe } from "./authentication.schemas.js";

@Controller({ path: "auth/tokens", version: "1" })
export class AuthenticationController {
  constructor(
    private readonly authenticateLocalUserHandler: AuthenticateLocalUserHandler,
  ) {}

  @Post()
  @PublicRoute()
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(loginRequestPipe) request: LoginRequest,
  ): Promise<AccessTokenResponse> {
    const token = await this.authenticateLocalUserHandler.exec(
      new AuthenticateLocalUserCommand(request.email, request.password),
    );
    return AuthenticationHttpMapper.toAccessTokenResponse(token);
  }
}
