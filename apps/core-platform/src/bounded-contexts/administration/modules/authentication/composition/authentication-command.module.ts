import { Module } from "@nestjs/common";

import { AccessControlModule } from "../../../../../shared/modules/access-control/access-control.module";
import { UserPersistenceModule } from "../../user/infra/persistence/user-persistence.module";
import { AuthenticateLocalUserHandler } from "../app/commands/authenticate-local-user/authenticate-local-user.handler";
import { AuthenticationInfraModule } from "../infra/authentication-infra.module";

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
