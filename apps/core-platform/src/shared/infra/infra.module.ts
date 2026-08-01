import { Global, Module } from '@nestjs/common';

import { ApplicationEventBus } from './messaging/application-event-bus';
import { InMemoryApplicationEventBus } from './messaging/in-memory-application-event-bus';
import { PgTransactionManager } from './persistence/pg-transaction-manager';
import { TransactionManager } from './persistence/transaction-manager';

@Global()
@Module({
  providers: [
    {
      provide: ApplicationEventBus,
      useClass: InMemoryApplicationEventBus,
    },
    {
      provide: TransactionManager,
      useClass: PgTransactionManager,
    },
  ],
  exports: [ApplicationEventBus, TransactionManager],
})
export class InfraModule {}
