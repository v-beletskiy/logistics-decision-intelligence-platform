import { Inject, Injectable } from "@nestjs/common";

import { APP_CONFIG, type AppConfig } from "../config/app-config";
import type {
  IntegrationEvent,
  IntegrationEventType,
} from "../messaging/integration-event";
import { PgDatabase } from "../persistence/pg-database";
import { TransactionManager } from "../persistence/transaction-manager";
import { type ClaimedOutboxEvent, OutboxStore } from "./outbox-store";

interface OutboxRow {
  readonly event_id: string;
  readonly event_type: IntegrationEventType;
  readonly event_version: number;
  readonly occurred_at: Date;
  readonly tenant_id: string;
  readonly initiated_by_user_id: string | null;
  readonly lock_token: string;
  readonly payload: Record<string, unknown>;
}

@Injectable()
export class PgOutboxStore extends OutboxStore {
  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly database: PgDatabase,
    private readonly transactionManager: TransactionManager,
  ) {
    super();
  }

  async enqueue(event: IntegrationEvent): Promise<void> {
    await this.database.query(
      `
        INSERT INTO shared.integration_outbox (
          event_id, event_type, event_version, occurred_at, tenant_id,
          initiated_by_user_id, payload
        ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
      `,
      [
        event.eventId,
        event.eventType,
        event.eventVersion,
        event.occurredAt,
        event.tenantId,
        event.initiatedByUserId ?? null,
        JSON.stringify(event.payload),
      ],
    );
  }

  async claimPendingBatch(
    limit: number,
  ): Promise<readonly ClaimedOutboxEvent[]> {
    return this.transactionManager.run(async () => {
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
          RETURNING outbox.event_id, outbox.event_type, outbox.event_version,
                    outbox.occurred_at, outbox.tenant_id,
                    outbox.initiated_by_user_id, outbox.lock_token,
                    outbox.payload
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

  private toEvent(row: OutboxRow): IntegrationEvent {
    return {
      eventId: row.event_id,
      eventType: row.event_type,
      eventVersion: row.event_version,
      occurredAt: row.occurred_at,
      tenantId: row.tenant_id,
      initiatedByUserId: row.initiated_by_user_id ?? undefined,
      payload: row.payload,
    };
  }
}
