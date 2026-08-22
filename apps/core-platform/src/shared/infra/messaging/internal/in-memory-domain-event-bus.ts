import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";

import { DomainEventBus } from "../../../app/messaging/domain-event-bus";
import type { DomainEvent } from "../../../domain/domain-event";

@Injectable()
export class InMemoryDomainEventBus extends DomainEventBus {
  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  async publish(event: DomainEvent): Promise<void> {
    await this.eventEmitter.emitAsync(event.type, event);
  }
}
