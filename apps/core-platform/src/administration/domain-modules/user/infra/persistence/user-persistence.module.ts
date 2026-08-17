import { Module } from "@nestjs/common";

import { UserAccountRepository } from "../../domain/user-account.repository";
import { PgUserAccountRepository } from "./repository/user-account.pg-repository";

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
