import {
  inboxConsumerId,
  type InboxConsumerId,
} from "./inbox/inbox-message";

declare const rabbitMqQueueNameBrand: unique symbol;

export type RabbitMqQueueName = string & {
  readonly [rabbitMqQueueNameBrand]: true;
};

export interface IntegrationSubscriptionIdentity {
  readonly consumerId: InboxConsumerId;
  readonly queue: RabbitMqQueueName;
}

/** Defines the stable operational identity of one integration subscription. */
export function integrationSubscriptionIdentity(input: {
  readonly consumerId: string;
  readonly queue: string;
}): IntegrationSubscriptionIdentity {
  return {
    consumerId: inboxConsumerId(input.consumerId),
    queue: rabbitMqQueueName(input.queue),
  };
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
