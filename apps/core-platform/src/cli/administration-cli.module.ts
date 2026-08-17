import { Module } from "@nestjs/common";

import { PasswordHasher } from "../administration/app/authentication/password-hasher";
import { ProvisionTenantAdministratorHandler } from "../administration/app/user/commands/provision-tenant-administrator/provision-tenant-administrator.handler";
import { UserAccountRepository } from "../administration/domain-modules/user/domain/user-account.repository";
import { PgUserAccountRepository } from "../administration/domain-modules/user/infra/persistence/repository/user-account.pg-repository";
import { Argon2PasswordHasher } from "../administration/infra/authentication/argon2-password-hasher";
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
export class AdministrationCliModule {}
