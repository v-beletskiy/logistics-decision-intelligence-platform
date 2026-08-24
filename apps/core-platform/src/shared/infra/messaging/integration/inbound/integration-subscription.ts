import { inboxConsumerId, type InboxConsumerId } from "./inbox/inbox-message.js";
import type { IntegrationEventContract } from "./integration-event-validator.js";

declare const rabbitMqQueueNameBrand: unique symbol;

export type RabbitMqQueueName = string & {
  readonly [rabbitMqQueueNameBrand]: true;
};

export interface IntegrationSubscription<
  TContracts extends readonly IntegrationEventContract[] =
    readonly IntegrationEventContract[],
> {
  readonly consumerId: InboxConsumerId;
  readonly queue: RabbitMqQueueName;
  readonly contracts: TContracts;
}

/** Defines and validates one consumer's stable broker identity and contracts. */
export function defineSubscription<
  const TContracts extends readonly IntegrationEventContract[],
>(input: {
  readonly consumerId: string;
  readonly queue: string;
  readonly contracts: TContracts;
}): IntegrationSubscription<TContracts> {
  if (input.contracts.length === 0) {
    throw new Error("An integration subscription must declare a contract.");
  }
  const eventTypes = input.contracts.map((contract) => contract.eventType);
  if (new Set(eventTypes).size !== eventTypes.length) {
    throw new Error(
      "An integration subscription cannot declare the same event type twice.",
    );
  }
  return Object.freeze({
    consumerId: inboxConsumerId(input.consumerId),
    queue: rabbitMqQueueName(input.queue),
    contracts: Object.freeze([...input.contracts]) as unknown as TContracts,
  });
}

export function rabbitMqQueueName(value: string): RabbitMqQueueName {
  if (
    Buffer.byteLength(value, "utf8") > 200 ||
    !/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(value)
  ) {
    throw new Error(
      "RabbitMQ queue name must be a stable dot/dash-delimited lowercase identifier of at most 200 bytes.",
    );
  }
  return value as RabbitMqQueueName;
}
