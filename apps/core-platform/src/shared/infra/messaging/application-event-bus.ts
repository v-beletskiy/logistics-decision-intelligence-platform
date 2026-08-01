import type { IntegrationEvent } from './integration-event';

export abstract class ApplicationEventBus {
  abstract publish(event: IntegrationEvent): Promise<void>;
}
