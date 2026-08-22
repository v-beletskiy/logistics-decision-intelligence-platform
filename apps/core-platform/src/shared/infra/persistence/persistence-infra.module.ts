import { Global, Module } from "@nestjs/common";

import { TrxManager } from "../../app/trx/trx-manager";
import { InboxStore } from "../messaging/integration/inbound/inbox/inbox-store";
import { PgInboxStore } from "../messaging/integration/inbound/inbox/pg-inbox-store";
import { OutboxStore } from "../messaging/integration/outbound/outbox/outbox-store";
import { PgOutboxStore } from "../messaging/integration/outbound/outbox/pg-outbox-store";
import { PgDatabase } from "./pg-database";
import { PgTrxManager } from "./pg-trx-manager";

@Global()
@Module({
  providers: [
    PgDatabase,
    { provide: TrxManager, useClass: PgTrxManager },
    { provide: OutboxStore, useClass: PgOutboxStore },
    { provide: InboxStore, useClass: PgInboxStore },
  ],
  exports: [PgDatabase, TrxManager, OutboxStore, InboxStore],
})
export class PersistenceInfraModule {}
