import type {
  CloudEvent,
  IntegrationEventId,
} from "@logistics-decision-intelligence/integration-events";

/** Stable logical consumer identity, independent of the broker queue name. */
declare const inboxConsumerIdBrand: unique symbol;

export type InboxConsumerId = string & {
  readonly [inboxConsumerIdBrand]: true;
};

export interface InboxMessageKey {
  readonly consumerId: InboxConsumerId;
  readonly eventId: IntegrationEventId;
}

export interface InboxMessage extends InboxMessageKey {
  readonly eventType: string;
}

export function inboxConsumerId(value: string): InboxConsumerId {
  if (value.length > 200 || !/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(value)) {
    throw new Error(
      "Inbox consumer ID must be a stable dot/dash-delimited lowercase identifier.",
    );
  }
  return value as InboxConsumerId;
}

export function toInboxMessage(
  consumerId: InboxConsumerId,
  event: CloudEvent,
): InboxMessage {
  return {
    consumerId,
    eventId: event.id,
    eventType: event.type,
  };
}
