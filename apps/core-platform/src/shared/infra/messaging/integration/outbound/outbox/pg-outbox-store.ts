import { Inject, Injectable } from "@nestjs/common";
import type { CloudEvent } from "@logistics-decision-intelligence/integration-events";

import { APP_CONFIG, type AppConfig } from "../../../../config/app-config.js";
import { PgDatabase } from "../../../../persistence/pg-database.js";
import { TrxManager } from "../../../../../app/trx/trx-manager.js";
import { type ClaimedOutboxEvent, OutboxStore } from "./outbox-store.js";

interface OutboxRow {
  readonly lock_token: string;
  readonly event: CloudEvent;
}

@Injectable()
export class PgOutboxStore extends OutboxStore {
  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly database: PgDatabase,
    private readonly trxManager: TrxManager,
  ) {
    super();
  }

  async enqueueMany(events: readonly CloudEvent[]): Promise<void> {
    if (events.length === 0) return;
    await this.database.query(
      `
        INSERT INTO shared.integration_outbox (
          event_id, occurred_at, event
        )
        SELECT
          (item ->> 'id')::uuid,
          (item ->> 'time')::timestamptz,
          item
        FROM jsonb_array_elements($1::jsonb) AS batch(item)
      `,
      [JSON.stringify(events)],
    );
  }

  async claimPendingBatch(
    limit: number,
  ): Promise<readonly ClaimedOutboxEvent[]> {
    return this.trxManager.run(async () => {
      const result = await this.database.query<OutboxRow>(
        `
          WITH candidates AS (
            SELECT event_id
            FROM shared.integration_outbox
            WHERE available_at <= now()
              AND (
                status = 'PENDING'
                OR (status = 'PROCESSING' AND locked_until <= now())
              )
            ORDER BY occurred_at
            FOR UPDATE SKIP LOCKED
            LIMIT $1
          )
          UPDATE shared.integration_outbox AS outbox
          SET status = 'PROCESSING',
              attempts = outbox.attempts + 1,
              locked_until = now() + $2::bigint * interval '1 millisecond',
              lock_token = gen_random_uuid()
          FROM candidates
          WHERE outbox.event_id = candidates.event_id
          RETURNING outbox.lock_token, outbox.event
        `,
        [limit, this.config.messaging.outboxProcessingLeaseMs],
      );
      return result.rows.map((row) => ({
        event: this.toEvent(row),
        lockToken: row.lock_token,
      }));
    });
  }

  async markPublished(eventId: string, lockToken: string): Promise<boolean> {
    const result = await this.database.query(
      `
        UPDATE shared.integration_outbox
        SET status = 'PUBLISHED', published_at = now(), locked_until = NULL,
            lock_token = NULL, last_error = NULL
        WHERE event_id = $1 AND status = 'PROCESSING' AND lock_token = $2
        RETURNING event_id
      `,
      [eventId, lockToken],
    );
    return result.rowCount === 1;
  }

  async reschedule(
    eventId: string,
    lockToken: string,
    availableAt: Date,
    error: Error,
  ): Promise<boolean> {
    const result = await this.database.query(
      `
        UPDATE shared.integration_outbox
        SET status = 'PENDING', available_at = $2, locked_until = NULL,
            lock_token = NULL, last_error = $4
        WHERE event_id = $1 AND status = 'PROCESSING' AND lock_token = $3
        RETURNING event_id
      `,
      [eventId, availableAt, lockToken, error.message.slice(0, 1_000)],
    );
    return result.rowCount === 1;
  }

  private toEvent(row: OutboxRow): CloudEvent {
    return row.event;
  }
}
