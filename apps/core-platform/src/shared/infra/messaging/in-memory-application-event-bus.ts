import { Injectable } from "@nestjs/common";

import { ApplicationEventBus } from "./application-event-bus";
import type { IntegrationEvent } from "./integration-event";

@Injectable()
export class InMemoryApplicationEventBus extends ApplicationEventBus {
  async publish(_event: IntegrationEvent): Promise<void> {
    // Event delivery is intentionally deferred until bounded-context contracts exist.
  }
}
