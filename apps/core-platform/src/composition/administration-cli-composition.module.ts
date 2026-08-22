import { Module } from "@nestjs/common";

import { PasswordHasher } from "../bounded-contexts/administration/modules/authentication/app/password-hasher";
import { ProvisionTenantAdministratorHandler } from "../bounded-contexts/administration/modules/user/app/commands/provision-tenant-administrator/provision-tenant-administrator.handler";
import { UserAccountRepository } from "../bounded-contexts/administration/modules/user/domain/user-account.repository";
import { PgUserAccountRepository } from "../bounded-contexts/administration/modules/user/infra/persistence/repository/pg-user-account.repository";
import { Argon2PasswordHasher } from "../bounded-contexts/administration/modules/authentication/infra/argon2-password-hasher";
import { AppConfigModule } from "../shared/infra/config/app-config.module";
import { PgDatabase } from "../shared/infra/persistence/pg-database";

@Module({
  imports: [AppConfigModule],
  providers: [
    PgDatabase,
    ProvisionTenantAdministratorHandler,
    { provide: PasswordHasher, useClass: Argon2PasswordHasher },
    { provide: UserAccountRepository, useClass: PgUserAccountRepository },
  ],
})
export class AdministrationCliCompositionModule {}
