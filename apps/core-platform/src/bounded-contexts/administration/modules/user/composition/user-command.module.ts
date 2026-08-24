import { Module } from "@nestjs/common";

import { AuthenticationInfraModule } from "../../authentication/infra/authentication-infra.module.js";
import { ProvisionTenantAdministratorHandler } from "../app/commands/provision-tenant-administrator/provision-tenant-administrator.handler.js";
import { UserPersistenceModule } from "../infra/persistence/user-persistence.module.js";

@Module({
  imports: [UserPersistenceModule, AuthenticationInfraModule],
  providers: [ProvisionTenantAdministratorHandler],
  exports: [ProvisionTenantAdministratorHandler],
})
export class UserCommandModule {}
