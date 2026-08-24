import { Global, Module } from "@nestjs/common";

import { TrxManager } from "../../app/trx/trx-manager.js";
import { InboxStore } from "../messaging/integration/inbound/inbox/inbox-store.js";
import { PgInboxStore } from "../messaging/integration/inbound/inbox/pg-inbox-store.js";
import { OutboxStore } from "../messaging/integration/outbound/outbox/outbox-store.js";
import { PgOutboxStore } from "../messaging/integration/outbound/outbox/pg-outbox-store.js";
import { PgDatabase } from "./pg-database.js";
import { PgTrxManager } from "./pg-trx-manager.js";

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
