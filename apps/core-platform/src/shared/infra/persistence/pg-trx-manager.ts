import { Injectable } from "@nestjs/common";

import { PgDatabase } from "./pg-database";
import { TrxManager } from "../../app/trx/trx-manager";

@Injectable()
export class PgTrxManager extends TrxManager {
  constructor(private readonly database: PgDatabase) {
    super();
  }

  async run<TResult>(operation: () => Promise<TResult>): Promise<TResult> {
    return this.database.runInTransaction(operation);
  }
}
