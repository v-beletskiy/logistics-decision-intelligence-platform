import { Injectable, Logger } from "@nestjs/common";

import type { IntegrationEvent } from "../messaging/integration-event";
import { NonRetryableMessageException } from "../messaging/messaging.exceptions";
import { TransactionManager } from "../persistence/transaction-manager";
import { InboxStore } from "./inbox-store";

@Injectable()
export class InboxProcessor {
  private readonly logger = new Logger(InboxProcessor.name);

  constructor(
    private readonly transactionManager: TransactionManager,
    private readonly inboxStore: InboxStore,
  ) {}

  async process(
    event: IntegrationEvent,
    handler: (event: IntegrationEvent) => Promise<void>,
  ): Promise<void> {
    await this.transactionManager.run(async () => {
      const started = await this.inboxStore.tryStart(
        event.eventId,
        event.eventType,
      );
      if (!started) return;

      try {
        await handler(event);
      } catch (error: unknown) {
        if (!(error instanceof NonRetryableMessageException)) {
          throw error;
        }
        this.logger.warn(
          `Acknowledging non-retryable integration event ${event.eventId}: ${error.message}`,
        );
      }

      await this.inboxStore.markCompleted(event.eventId);
    });
  }
}
