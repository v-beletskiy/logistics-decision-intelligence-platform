import type { IssuedAccessToken } from "../../../../../../shared/modules/access-control/app/authentication/access-token-issuer.js";
import type { AccessTokenResponse } from "./authentication.http-contracts.js";

export class AuthenticationHttpMapper {
  static toAccessTokenResponse(token: IssuedAccessToken): AccessTokenResponse {
    return {
      accessToken: token.accessToken,
      tokenType: token.tokenType,
      expiresIn: token.expiresIn,
    };
  }
}
