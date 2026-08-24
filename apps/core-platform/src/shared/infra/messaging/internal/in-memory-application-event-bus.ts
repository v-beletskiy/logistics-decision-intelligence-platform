import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";

import {
  InternalApplicationEventBus,
  type InternalApplicationEvent,
} from "../../../app/messaging/internal-application-event-bus.js";

@Injectable()
export class InMemoryApplicationEventBus extends InternalApplicationEventBus {
  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  async publish<TPayload, TType extends string>(
    event: InternalApplicationEvent<TPayload, TType>,
  ): Promise<void> {
    await this.eventEmitter.emitAsync(event.type, event);
  }
}
