import { Global, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";

import { AccessManager } from "./app/authorization/access-manager";
import { CaslAccessManager } from "./infra/casl/casl-access-manager";
import { JwtAuthGuard } from "./infra/authentication/jwt-auth.guard";
import { AccessTokenIssuer } from "./app/authentication/access-token-issuer";
import { IdentityTokenVerifier } from "./app/authentication/identity-token-verifier";
import { JoseAccessTokenService } from "./infra/jwt/jose-access-token.service";

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
