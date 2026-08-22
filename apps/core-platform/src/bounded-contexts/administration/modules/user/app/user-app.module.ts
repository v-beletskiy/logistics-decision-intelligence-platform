import { Module } from "@nestjs/common";

import { UserPersistenceModule } from "../infra/persistence/user-persistence.module";
import { AuthenticationInfraModule } from "../../authentication/infra/authentication-infra.module";
import { ProvisionTenantAdministratorHandler } from "./commands/provision-tenant-administrator/provision-tenant-administrator.handler";

@Module({
  imports: [UserPersistenceModule, AuthenticationInfraModule],
  providers: [ProvisionTenantAdministratorHandler],
  exports: [ProvisionTenantAdministratorHandler],
})
export class UserAppModule {}
