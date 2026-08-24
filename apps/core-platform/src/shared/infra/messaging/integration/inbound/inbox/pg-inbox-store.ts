import { Injectable } from "@nestjs/common";

import { PgDatabase } from "../../../../persistence/pg-database.js";
import { InboxClaimResult, InboxStore } from "./inbox-store.js";
import type { InboxMessage, InboxMessageKey } from "./inbox-message.js";

@Injectable()
export class PgInboxStore extends InboxStore {
  constructor(private readonly database: PgDatabase) {
    super();
  }

  async claim(
    message: InboxMessage,
    leaseMs: number,
  ): Promise<InboxClaimResult> {
    // locked_until protects from duplicate deliveries by multiple consumer workers
    // and from worker crashes to avoid stuck in PROCESSING inbox messages.
    const result = await this.database.query(
      `
        INSERT INTO shared.integration_inbox (
          consumer_name,
          event_id,
          event_type,
          status,
          locked_until
        )
        VALUES ($1, $2, $3, 'PROCESSING', now() + ($4 * interval '1 millisecond'))
        ON CONFLICT (consumer_name, event_id) DO UPDATE
        SET
          event_type = EXCLUDED.event_type,
          status = 'PROCESSING',
          locked_until = EXCLUDED.locked_until
        WHERE shared.integration_inbox.status = 'PROCESSING'
          AND shared.integration_inbox.locked_until <= now()
        RETURNING event_id
      `,
      [message.consumerId, message.eventId, message.eventType, leaseMs],
    );
    return result.rowCount === 1
      ? InboxClaimResult.Claimed
      : InboxClaimResult.AlreadyProcessedOrActive;
  }

  async markCompleted(message: InboxMessageKey): Promise<void> {
    await this.database.query(
      `
        UPDATE shared.integration_inbox
        SET status = 'COMPLETED',
            processed_at = now(),
            locked_until = NULL
        WHERE consumer_name = $1 AND event_id = $2
      `,
      [message.consumerId, message.eventId],
    );
  }

  async release(message: InboxMessageKey): Promise<void> {
    await this.database.query(
      `
        UPDATE shared.integration_inbox
        SET locked_until = now()
        WHERE consumer_name = $1
          AND event_id = $2
          AND status = 'PROCESSING'
      `,
      [message.consumerId, message.eventId],
    );
  }
}
