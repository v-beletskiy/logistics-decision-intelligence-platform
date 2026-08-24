import { Injectable } from "@nestjs/common";

import { PgDatabase } from "../../../../../../../shared/infra/persistence/pg-database.js";
import { PG_SQLSTATE } from "../../../../../../../shared/infra/persistence/pg-error.js";
import {
  execAndTranslatePgConstraintViolations,
  type PgConstraintViolationTranslation,
} from "../../../../../../../shared/infra/persistence/pg-repository-write.js";
import { UserEmailConflictException } from "../../../app/user.exceptions.js";
import { UserAccount } from "../../../domain/user-account.js";
import { UserAccountRepository } from "../../../domain/user-account.repository.js";
import { UserAccountMapper } from "./mappers/user-account.mapper.js";
import { findUserAccountByEmail } from "./queries/user.find-by-email.queries.js";
import { insertUserAccount } from "./queries/user.insert.queries.js";

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
