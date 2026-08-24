import { Inject, Injectable, Logger } from "@nestjs/common";

import type { CloudEvent } from "@logistics-decision-intelligence/integration-events";
import { TrxManager } from "../../../../../app/trx/trx-manager.js";
import { NonRetryableMessageException } from "../../errors.js";
import { APP_CONFIG, type AppConfig } from "../../../../config/app-config.js";
import { InboxClaimResult, InboxStore } from "./inbox-store.js";
import { toInboxMessage, type InboxConsumerId } from "./inbox-message.js";

@Injectable()
export class InboxProcessor {
  private readonly logger = new Logger(InboxProcessor.name);

  constructor(
    private readonly trxManager: TrxManager,
    private readonly inboxStore: InboxStore,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  async process<TEvent extends CloudEvent>(
    consumerId: InboxConsumerId,
    event: TEvent,
    handler: (event: TEvent) => Promise<void>,
  ): Promise<void> {
    const message = toInboxMessage(consumerId, event);
    const claim = await this.trxManager.run(() =>
      this.inboxStore.claim(
        message,
        this.config.messaging.outboxProcessingLeaseMs,
      ),
    );
    if (claim !== InboxClaimResult.Claimed) return;

    try {
      await handler(event);
    } catch (error: unknown) {
      if (!(error instanceof NonRetryableMessageException)) {
        await this.trxManager.run(() => this.inboxStore.release(message));
        throw error;
      }
      this.logger.warn(
        `Acknowledging non-retryable integration event ${event.id}: ${error.message}`,
      );
    }

    await this.trxManager.run(() => this.inboxStore.markCompleted(message));
  }
}
