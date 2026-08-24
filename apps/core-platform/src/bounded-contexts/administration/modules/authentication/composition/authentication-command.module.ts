import { Module } from "@nestjs/common";

import { AccessControlModule } from "../../../../../shared/modules/access-control/access-control.module.js";
import { UserPersistenceModule } from "../../user/infra/persistence/user-persistence.module.js";
import { AuthenticateLocalUserHandler } from "../app/commands/authenticate-local-user/authenticate-local-user.handler.js";
import { AuthenticationInfraModule } from "../infra/authentication-infra.module.js";

@Module({
  imports: [
    AccessControlModule,
    UserPersistenceModule,
    AuthenticationInfraModule,
  ],
  providers: [AuthenticateLocalUserHandler],
  exports: [AuthenticateLocalUserHandler],
})
export class AuthenticationCommandModule {}
