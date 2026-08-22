import { Injectable } from "@nestjs/common";

import { PgDatabase } from "../../../../../../../shared/infra/persistence/pg-database";
import {
  isPgConstraintViolation,
  PG_SQLSTATE,
} from "../../../../../../../shared/infra/persistence/pg-error";
import { UserEmailConflictException } from "../../../app/user.exceptions";
import { UserAccount } from "../../../domain/user-account";
import { UserAccountRepository } from "../../../domain/user-account.repository";
import { UserAccountMapper } from "./mappers/user-account.mapper";
import { findUserAccountByEmail } from "./queries/user.find-by-email.queries";
import { insertUserAccount } from "./queries/user.insert.queries";

const USER_EMAIL_UNIQUE_CONSTRAINT = "users_email_unique";

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
    try {
      await this.database.exec(
        insertUserAccount,
        UserAccountMapper.toPersistence(account),
      );
    } catch (error: unknown) {
      if (
        isPgConstraintViolation(error, {
          sqlState: PG_SQLSTATE.UNIQUE_VIOLATION,
          constraint: USER_EMAIL_UNIQUE_CONSTRAINT,
        })
      ) {
        throw new UserEmailConflictException({ cause: error });
      }
      throw error;
    }
  }
}
