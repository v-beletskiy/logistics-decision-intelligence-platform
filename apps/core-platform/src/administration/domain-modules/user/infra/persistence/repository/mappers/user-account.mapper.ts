import { Role } from "../../../../../../../shared/access-control/roles/role.enum";
import { hydratePersistenceData } from "../../../../../../../shared/infra/persistence/persistence-hydration";
import { UserAccount } from "../../../../domain/user-account";
import type { IFindUserAccountByEmailResult } from "../queries/user.find-by-email.queries";
import type { IInsertUserAccountParams } from "../queries/user.insert.queries";

/** Maps the User Account aggregate to and from its PostgreSQL representation. */
export class UserAccountMapper {
  static toDomain(row: IFindUserAccountByEmailResult): UserAccount {
    return hydratePersistenceData("user account", () =>
      UserAccount.reconstitute({
        id: row.id,
        tenantId: row.tenant_id,
        email: row.email,
        passwordHash: row.password_hash,
        roles: UserAccountMapper.toRoles(row.roles),
        active: row.active,
      }),
    );
  }

  static toPersistence(account: UserAccount): IInsertUserAccountParams {
    return {
      id: account.id,
      tenantId: account.tenantId,
      email: account.email,
      passwordHash: account.passwordHash,
      roles: [...account.roles],
      active: account.active,
    };
  }

  private static toRoles(values: readonly string[]): readonly Role[] {
    if (values.some((value) => !Object.values(Role).includes(value as Role))) {
      throw new TypeError("Stored user roles are invalid.");
    }
    return values as readonly Role[];
  }
}
