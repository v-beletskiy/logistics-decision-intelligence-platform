import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { InternalApplicationEventBus } from './application-event-bus';
import type { IntegrationEvent } from './integration-event';

@Injectable()
export class InMemoryApplicationEventBus extends InternalApplicationEventBus {
  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  async publish(event: IntegrationEvent): Promise<void> {
    await this.eventEmitter.emitAsync(event.eventType, event);
  }
}
