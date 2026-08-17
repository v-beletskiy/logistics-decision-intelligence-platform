import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";

import { PublicRoute } from "../../../../shared/access-control/authentication/public-route.decorator";
import { AuthenticateLocalUserCommand } from "../../../app/authentication/commands/authenticate-local-user/authenticate-local-user.command";
import { AuthenticateLocalUserHandler } from "../../../app/authentication/commands/authenticate-local-user/authenticate-local-user.handler";
import type {
  AccessTokenResponse,
  LoginRequest,
} from "./authentication.http-contracts";
import { AuthenticationHttpMapper } from "./authentication.http-mapper";
import { loginRequestPipe } from "./authentication.schemas";

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
