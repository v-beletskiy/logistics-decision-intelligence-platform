import { Injectable, Logger } from "@nestjs/common";

import type { CloudEvent } from "@logistics-decision-intelligence/integration-events";
import { TransactionManager } from "../../../../persistence/transaction-manager";
import { NonRetryableMessageException } from "../../errors";
import { InboxStore } from "./inbox-store";
import {
  toInboxMessage,
  type InboxConsumerId,
} from "./inbox-message";

@Injectable()
export class InboxProcessor {
  private readonly logger = new Logger(InboxProcessor.name);

  constructor(
    private readonly transactionManager: TransactionManager,
    private readonly inboxStore: InboxStore,
  ) {}

  async process<TEvent extends CloudEvent>(
    consumerId: InboxConsumerId,
    event: TEvent,
    handler: (event: TEvent) => Promise<void>,
  ): Promise<void> {
    await this.transactionManager.run(async () => {
      const message = toInboxMessage(consumerId, event);
      const started = await this.inboxStore.tryStart(message);
      if (!started) return;

      try {
        await handler(event);
      } catch (error: unknown) {
        if (!(error instanceof NonRetryableMessageException)) {
          throw error;
        }
        this.logger.warn(
          `Acknowledging non-retryable integration event ${event.id}: ${error.message}`,
        );
      }

      await this.inboxStore.markCompleted(message);
    });
  }
}
