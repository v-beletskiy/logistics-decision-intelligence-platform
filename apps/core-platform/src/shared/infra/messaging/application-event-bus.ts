import type { IntegrationEvent } from './integration-event';

export abstract class ApplicationEventBus {
  abstract publish(event: IntegrationEvent): Promise<void>;
}

/**
 * Delivers integration events to bounded contexts within this modular monolith.
 */
export abstract class InternalApplicationEventBus extends ApplicationEventBus {}

/**
 * Delivers integration events to independently deployed services.
 */
export abstract class DistributedApplicationEventBus extends ApplicationEventBus {}
