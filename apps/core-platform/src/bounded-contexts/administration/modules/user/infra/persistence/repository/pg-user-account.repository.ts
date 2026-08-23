import { Injectable } from "@nestjs/common";

import { PgDatabase } from "../../../../../../../shared/infra/persistence/pg-database";
import { PG_SQLSTATE } from "../../../../../../../shared/infra/persistence/pg-error";
import {
  execAndTranslatePgConstraintViolations,
  type PgConstraintViolationTranslation,
} from "../../../../../../../shared/infra/persistence/pg-repository-write";
import { UserEmailConflictException } from "../../../app/user.exceptions";
import { UserAccount } from "../../../domain/user-account";
import { UserAccountRepository } from "../../../domain/user-account.repository";
import { UserAccountMapper } from "./mappers/user-account.mapper";
import { findUserAccountByEmail } from "./queries/user.find-by-email.queries";
import { insertUserAccount } from "./queries/user.insert.queries";

const USER_EMAIL_UNIQUE_CONSTRAINT = "users_email_unique";
const USER_WRITE_CONSTRAINT_TRANSLATIONS = [
  {
    sqlState: PG_SQLSTATE.UNIQUE_VIOLATION,
    constraint: USER_EMAIL_UNIQUE_CONSTRAINT,
    toError: (cause: unknown) => new UserEmailConflictException({ cause }),
  },
] satisfies readonly PgConstraintViolationTranslation[];

@Injectable()
export class PgUserAccountRepository extends UserAccountRepository {
  constructor(private readonly database: PgDatabase) {
    super();
  }

  async findByEmail(normalizedEmail: string): Promise<UserAccount | null> {
    const rows = await this.database.exec(findUserAccountByEmail, {
      email: normalizedEmail,
    });
    const row = rows[0];
    return row === undefined ? null : UserAccountMapper.toDomain(row);
  }

  async add(account: UserAccount): Promise<void> {
    await execAndTranslatePgConstraintViolations({
      database: this.database,
      statement: insertUserAccount,
      params: UserAccountMapper.toPersistence(account),
      options: { translations: USER_WRITE_CONSTRAINT_TRANSLATIONS },
    });
  }
}
