import { Global, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";

import { AccessManager } from "./app/authorization/access-manager.js";
import { CaslAccessManager } from "./infra/casl/casl-access-manager.js";
import { JwtAuthGuard } from "./infra/authentication/jwt-auth.guard.js";
import { AccessTokenIssuer } from "./app/authentication/access-token-issuer.js";
import { IdentityTokenVerifier } from "./app/authentication/identity-token-verifier.js";
import { JoseAccessTokenService } from "./infra/jwt/jose-access-token.service.js";

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
