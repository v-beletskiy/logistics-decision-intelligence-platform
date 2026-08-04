import { Injectable } from '@nestjs/common';

import { PgDatabase } from '../persistence/pg-database';
import { InboxStore } from './inbox-store';

@Injectable()
export class PgInboxStore extends InboxStore {
  constructor(private readonly database: PgDatabase) {
    super();
  }

  async tryStart(eventId: string, eventType: string): Promise<boolean> {
    const result = await this.database.query(
      `
        INSERT INTO shared.integration_inbox (event_id, event_type)
        VALUES ($1, $2)
        ON CONFLICT (event_id) DO NOTHING
      `,
      [eventId, eventType],
    );
    return result.rowCount === 1;
  }

  async markCompleted(eventId: string): Promise<void> {
    await this.database.query(
      `
        UPDATE shared.integration_inbox
        SET processed_at = now()
        WHERE event_id = $1
      `,
      [eventId],
    );
  }
}
