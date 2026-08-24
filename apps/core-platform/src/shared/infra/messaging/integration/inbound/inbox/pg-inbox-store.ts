import { Injectable } from "@nestjs/common";

import { PgDatabase } from "../../../../persistence/pg-database.js";
import { InboxStore } from "./inbox-store.js";
import type { InboxMessage, InboxMessageKey } from "./inbox-message.js";

@Injectable()
export class PgInboxStore extends InboxStore {
  constructor(private readonly database: PgDatabase) {
    super();
  }

  async tryStart(message: InboxMessage): Promise<boolean> {
    const result = await this.database.query(
      `
        INSERT INTO shared.integration_inbox (consumer_name, event_id, event_type)
        VALUES ($1, $2, $3)
        ON CONFLICT (consumer_name, event_id) DO NOTHING
      `,
      [message.consumerId, message.eventId, message.eventType],
    );
    return result.rowCount === 1;
  }

  async markCompleted(message: InboxMessageKey): Promise<void> {
    await this.database.query(
      `
        UPDATE shared.integration_inbox
        SET processed_at = now()
        WHERE consumer_name = $1 AND event_id = $2
      `,
      [message.consumerId, message.eventId],
    );
  }
}
