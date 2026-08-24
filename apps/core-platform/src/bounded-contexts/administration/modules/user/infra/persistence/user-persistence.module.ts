import { Module } from "@nestjs/common";

import { UserAccountRepository } from "../../domain/user-account.repository.js";
import { PgUserAccountRepository } from "./repository/pg-user-account.repository.js";

@Module({
  providers: [
    {
      provide: UserAccountRepository,
      useClass: PgUserAccountRepository,
    },
  ],
  exports: [UserAccountRepository],
})
export class UserPersistenceModule {}
