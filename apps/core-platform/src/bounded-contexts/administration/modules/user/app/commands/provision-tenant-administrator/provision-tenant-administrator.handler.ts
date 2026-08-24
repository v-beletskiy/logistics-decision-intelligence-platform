import { Injectable } from "@nestjs/common";

import { Role } from "../../../../../../../shared/modules/access-control/domain/role.js";
import { UserAccount } from "../../../domain/user-account.js";
import { UserAccountRepository } from "../../../domain/user-account.repository.js";
import { UserEmail } from "../../../domain/user-email.value-object.js";
import { LocalPasswordPolicy } from "../../../../authentication/app/local-password.policy.js";
import { PasswordHasher } from "../../../../authentication/app/password-hasher.js";
import { ProvisionTenantAdministratorCommand } from "./provision-tenant-administrator.command.js";
import { UserEmailConflictException } from "../../user.exceptions.js";

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
