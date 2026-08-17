import { Module } from "@nestjs/common";

import { UserPersistenceModule } from "../../domain-modules/user/infra/persistence/user-persistence.module";
import { AuthenticationInfrastructureModule } from "../../infra/authentication/authentication-infrastructure.module";
import { ProvisionTenantAdministratorHandler } from "./commands/provision-tenant-administrator/provision-tenant-administrator.handler";

@Module({
  imports: [UserPersistenceModule, AuthenticationInfrastructureModule],
  providers: [ProvisionTenantAdministratorHandler],
  exports: [ProvisionTenantAdministratorHandler],
})
export class UserAppModule {}
