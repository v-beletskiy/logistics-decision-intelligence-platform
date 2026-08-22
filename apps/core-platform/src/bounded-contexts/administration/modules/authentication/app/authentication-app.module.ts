import { Module } from "@nestjs/common";

import { AccessControlModule } from "../../../../../shared/modules/access-control/access-control.module";
import { UserPersistenceModule } from "../../user/infra/persistence/user-persistence.module";
import { AuthenticationInfraModule } from "../infra/authentication-infra.module";
import { AuthenticateLocalUserHandler } from "./commands/authenticate-local-user/authenticate-local-user.handler";

@Module({
  imports: [
    AccessControlModule,
    UserPersistenceModule,
    AuthenticationInfraModule,
  ],
  providers: [AuthenticateLocalUserHandler],
  exports: [AuthenticateLocalUserHandler],
})
export class AuthenticationAppModule {}
