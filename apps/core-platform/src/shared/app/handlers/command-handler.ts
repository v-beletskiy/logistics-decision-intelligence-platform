import type { DomainEvent } from "../../domain/domain-event";
import { DomainEventBus } from "../messaging/domain-event-bus";
import { TrxManager } from "../trx/trx-manager";

export interface DomainEventsSource {
  pullDomainEvents(): readonly DomainEvent[];
}

export interface TransactionalCommandResult<TResult> {
  readonly result: TResult;
  readonly eventsFrom: readonly DomainEventsSource[];
}

export abstract class CommandHandler {
  protected constructor(
    protected readonly trxManager: TrxManager,
    protected readonly domainEventBus: DomainEventBus,
  ) {}

  /** Runs the complete read-decide-write use case in one transaction. */
  protected async execUseCaseTrx<TResult>(
    operation: () => Promise<TransactionalCommandResult<TResult>>,
  ): Promise<TResult> {
    return this.trxManager.run(async () => {
      const { result, eventsFrom } = await operation();
      for (const aggregate of eventsFrom) {
        for (const event of aggregate.pullDomainEvents()) {
          await this.domainEventBus.publish(event);
        }
      }
      return result;
    });
  }
}
