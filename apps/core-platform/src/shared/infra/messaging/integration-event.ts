import { IntegrationEventMetadata } from "./integration-event.factory";

/**
 * Producer-owned event names <producer-bounded-context>.<aggregate-or-subdomain>.<past-tense-business-fact>, for example
 * `operational-workspace.route.created`.
 */
export type IntegrationEventType = `${string}.${string}.${string}`;

export interface IntegrationEvent extends IntegrationEventMetadata {
  readonly payload: Readonly<Record<string, unknown>>;
}
