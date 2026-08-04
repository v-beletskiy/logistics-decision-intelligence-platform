import { Injectable } from '@nestjs/common';

import { DistributedApplicationEventBus } from '../messaging/application-event-bus';
import type { IntegrationEvent } from '../messaging/integration-event';
import { OutboxStore } from './outbox-store';

/**
 * Distributed event delivery starts by persisting an event in the transaction
 * that changed the business state. RabbitMQ publication is performed later.
 */
@Injectable()
export class TransactionalOutboxApplicationEventBus extends DistributedApplicationEventBus {
  constructor(private readonly outboxStore: OutboxStore) {
    super();
  }

  async publish(event: IntegrationEvent): Promise<void> {
    await this.outboxStore.enqueue(event);
  }
}
