import { Global, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";

import { AccessManager } from "./authorization/access-manager";
import { CaslAccessManager } from "./casl/casl-access-manager";
import { JwtAuthGuard } from "./authentication/jwt-auth.guard";
import { AccessTokenIssuer } from "./jwt/access-token-issuer";
import { IdentityTokenVerifier } from "./jwt/identity-token-verifier";
import { JoseAccessTokenService } from "./jwt/jose-access-token.service";

@Global()
@Module({
  providers: [
    JoseAccessTokenService,
    {
      provide: AccessTokenIssuer,
      useExisting: JoseAccessTokenService,
    },
    {
      provide: IdentityTokenVerifier,
      useExisting: JoseAccessTokenService,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: AccessManager,
      useClass: CaslAccessManager,
    },
  ],
  exports: [AccessManager, AccessTokenIssuer, IdentityTokenVerifier],
})
export class AccessControlModule {}
