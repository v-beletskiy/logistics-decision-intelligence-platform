/** RabbitMQ resources shared by inbound and outbound integration-event flows. */
export const IntegrationTopology = {
  exchanges: {
    integration: {
      name: "logistics.integration",
      type: "topic",
      durable: true,
    },
    deadLetter: {
      name: "logistics.integration.dlx",
      type: "topic",
      durable: true,
    },
  },
  retryQueueName: (queueName: string) => `${queueName}.retry`,
  deadLetterQueueName: (queueName: string) => `${queueName}.dead`,
  deadLetterRoutingKey: (queueName: string) => `queue.${queueName}`,
} as const;
