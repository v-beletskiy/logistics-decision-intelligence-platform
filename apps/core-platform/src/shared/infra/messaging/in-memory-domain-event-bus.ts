import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import type { DomainEvent } from '../../domain/shared-kernel/events/domain-event';
import { DomainEventBus } from './domain-event-bus';

@Injectable()
export class InMemoryDomainEventBus extends DomainEventBus {
  constructor(private readonly eventEmitter: EventEmitter2) { super(); }

  async publish(event: DomainEvent): Promise<void> {
    await this.eventEmitter.emitAsync(event.type, event);
  }
}
