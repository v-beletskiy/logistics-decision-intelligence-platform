import { Injectable } from "@nestjs/common";
import type { Channel } from "amqplib";

import { IntegrationTopology } from "./topology.js";

export interface IntegrationSubscriptionTopology {
  readonly queueName: string;
  readonly eventTypes: readonly string[];
}

/**
 * Declares the RabbitMQ resources that implement the integration-event
 * topology.
 */
@Injectable()
export class RabbitMqTopologyProvisioner {
  async assertExchanges(channel: Channel): Promise<void> {
    for (const exchange of Object.values(IntegrationTopology.exchanges)) {
      await channel.assertExchange(exchange.name, exchange.type, {
        durable: exchange.durable,
      });
    }
  }

  async assertSubscription(
    channel: Channel,
    subscription: IntegrationSubscriptionTopology,
  ): Promise<void> {
    await this.assertExchanges(channel);

    const retryQueueName = IntegrationTopology.retryQueueName(
      subscription.queueName,
    );
    const deadLetterQueueName = IntegrationTopology.deadLetterQueueName(
      subscription.queueName,
    );
    const deadLetterRoutingKey = IntegrationTopology.deadLetterRoutingKey(
      subscription.queueName,
    );

    const mainQueue = await channel.assertQueue(subscription.queueName, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": IntegrationTopology.exchanges.deadLetter.name,
        "x-dead-letter-routing-key": deadLetterRoutingKey,
      },
    });
    await channel.assertQueue(retryQueueName, {
      durable: true,
      arguments: {
        // The default exchange routes directly to the original subscription
        // queue. A retry must not be broadcast to every consumer of the event.
        "x-dead-letter-exchange": "",
        "x-dead-letter-routing-key": mainQueue.queue,
      },
    });
    await channel.assertQueue(deadLetterQueueName, { durable: true });
    await channel.bindQueue(
      deadLetterQueueName,
      IntegrationTopology.exchanges.deadLetter.name,
      deadLetterRoutingKey,
    );

    for (const eventType of subscription.eventTypes) {
      await channel.bindQueue(
        mainQueue.queue,
        IntegrationTopology.exchanges.integration.name,
        eventType,
      );
    }
  }
}
