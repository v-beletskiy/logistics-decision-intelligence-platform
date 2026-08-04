import { Inject, Injectable, type OnModuleDestroy } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import {
  Pool,
  type PoolClient,
  type QueryResult,
  type QueryResultRow,
} from 'pg';

import { APP_CONFIG, type AppConfig } from '../config/app-config';

@Injectable()
export class PgDatabase implements OnModuleDestroy {
  private readonly pool: Pool;
  private readonly transactionStorage = new AsyncLocalStorage<PoolClient>();

  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    this.pool = new Pool({
      connectionString: config.database.url,
      max: config.database.poolMax,
    });
  }

  async query<TResult extends QueryResultRow = QueryResultRow>(
    text: string,
    values: readonly unknown[] = [],
  ): Promise<QueryResult<TResult>> {
    const client = this.transactionStorage.getStore() ?? this.pool;
    return client.query<TResult>(text, [...values]);
  }

  async runInTransaction<TResult>(
    operation: () => Promise<TResult>,
  ): Promise<TResult> {
    // for nested transactions to reuse DB client
    if (this.transactionStorage.getStore() !== undefined) {
      return operation();
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await this.transactionStorage.run(client, operation);
      await client.query('COMMIT');
      return result;
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
