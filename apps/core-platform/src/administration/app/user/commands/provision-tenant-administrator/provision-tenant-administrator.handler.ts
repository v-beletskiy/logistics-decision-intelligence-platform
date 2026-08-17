import { Injectable } from "@nestjs/common";

import { Role } from "../../../../../shared/access-control/roles/role.enum";
import { UserAccount } from "../../../../domain-modules/user/domain/user-account";
import { UserAccountRepository } from "../../../../domain-modules/user/domain/user-account.repository";
import { UserEmail } from "../../../../domain-modules/user/domain/user-email.value-object";
import { LocalPasswordPolicy } from "../../../authentication/local-password.policy";
import { PasswordHasher } from "../../../authentication/password-hasher";
import { ProvisionTenantAdministratorCommand } from "./provision-tenant-administrator.command";
import { UserEmailConflictException } from "../../user.exceptions";

@Injectable()
export class ProvisionTenantAdministratorHandler {
  constructor(
    private readonly users: UserAccountRepository,
    private readonly passwords: PasswordHasher,
  ) {}

  async exec(command: ProvisionTenantAdministratorCommand): Promise<string> {
    const email = UserEmail.create(command.email).value;
    if (await this.users.findByEmail(email)) {
      throw new UserEmailConflictException();
    }
    LocalPasswordPolicy.assertAccepts(command.password);
    const account = UserAccount.create({
      tenantId: command.tenantId,
      email,
      passwordHash: await this.passwords.hash(command.password),
      roles: [Role.Administrator],
    });
    await this.users.add(account);
    return account.id;
  }
}
