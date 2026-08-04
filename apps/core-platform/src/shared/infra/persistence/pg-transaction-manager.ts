import { Injectable } from '@nestjs/common';

import { PgDatabase } from './pg-database';
import { TransactionManager } from './transaction-manager';

@Injectable()
export class PgTransactionManager extends TransactionManager {
  constructor(private readonly database: PgDatabase) {
    super();
  }

  async run<TResult>(operation: () => Promise<TResult>): Promise<TResult> {
    return this.database.runInTransaction(operation);
  }
}
