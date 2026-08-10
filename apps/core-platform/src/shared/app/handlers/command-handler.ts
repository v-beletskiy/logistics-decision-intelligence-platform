import type { DomainEvent } from "../../domain/shared-kernel/events/domain-event";
import { DomainEventBus } from "../messaging/domain-event-bus";
import { TransactionManager } from "../../infra/persistence/transaction-manager";

export interface DomainEventsSource {
  pullDomainEvents(): readonly DomainEvent[];
}

export abstract class CommandHandler {
  protected constructor(
    protected readonly trxManager: TransactionManager,
    protected readonly domainEventBus: DomainEventBus,
  ) {}

  protected async execTrxWithDomainEvents(
    persist: () => Promise<void>,
    aggregate: DomainEventsSource,
  ): Promise<void> {
    const domainEvents = aggregate.pullDomainEvents();
    await this.trxManager.run(async () => {
      await persist();
      for (const event of domainEvents) {
        await this.domainEventBus.publish(event);
      }
    });
  }
}
