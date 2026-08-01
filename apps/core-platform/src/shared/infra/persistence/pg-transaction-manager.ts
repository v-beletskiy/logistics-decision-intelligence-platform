import { Injectable } from '@nestjs/common';

import { TransactionManager } from './transaction-manager';

@Injectable()
export class PgTransactionManager extends TransactionManager {
  async run<TResult>(_operation: () => Promise<TResult>): Promise<TResult> {
    throw new Error('PgTransactionManager has not been implemented.');
  }
}
