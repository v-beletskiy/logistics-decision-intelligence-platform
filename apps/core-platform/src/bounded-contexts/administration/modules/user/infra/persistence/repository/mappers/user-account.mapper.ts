import { Role } from "../../../../../../../../shared/modules/access-control/domain/role.js";
import { hydratePersistenceData } from "../../../../../../../../shared/infra/persistence/persistence-hydration.js";
import { UserAccount } from "../../../../domain/user-account.js";
import type { IFindUserAccountByEmailResult } from "../queries/user.find-by-email.queries.js";
import type { IInsertUserAccountParams } from "../queries/user.insert.queries.js";

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
