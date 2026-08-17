import { Module } from "@nestjs/common";

import { AccessControlModule } from "../../../shared/access-control/access-control.module";
import { UserPersistenceModule } from "../../domain-modules/user/infra/persistence/user-persistence.module";
import { AuthenticationInfrastructureModule } from "../../infra/authentication/authentication-infrastructure.module";
import { AuthenticateLocalUserHandler } from "./commands/authenticate-local-user/authenticate-local-user.handler";

@Module({
  imports: [
    AccessControlModule,
    UserPersistenceModule,
    AuthenticationInfrastructureModule,
  ],
  providers: [AuthenticateLocalUserHandler],
  exports: [AuthenticateLocalUserHandler],
})
export class AuthenticationAppModule {}
