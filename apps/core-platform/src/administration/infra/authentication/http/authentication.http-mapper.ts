import type { IssuedAccessToken } from "../../../../shared/access-control/jwt/access-token-issuer";
import type { AccessTokenResponse } from "./authentication.http-contracts";

export class AuthenticationHttpMapper {
  static toAccessTokenResponse(token: IssuedAccessToken): AccessTokenResponse {
    return {
      accessToken: token.accessToken,
      tokenType: token.tokenType,
      expiresIn: token.expiresIn,
    };
  }
}
