import { Global, Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";

import { DomainEventBus } from "../../../app/messaging/domain-event-bus.js";
import { InternalApplicationEventBus } from "../../../app/messaging/internal-application-event-bus.js";
import { InMemoryApplicationEventBus } from "./in-memory-application-event-bus.js";
import { InMemoryDomainEventBus } from "./in-memory-domain-event-bus.js";

@Global()
@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [
    {
      provide: DomainEventBus,
      useExisting: InMemoryDomainEventBus,
    },
    {
      provide: InternalApplicationEventBus,
      useExisting: InMemoryApplicationEventBus,
    },
  ],
  exports: [DomainEventBus, InternalApplicationEventBus],
})
export class InternalMessagingInfraModule {}
