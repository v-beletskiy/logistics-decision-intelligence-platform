import {
  Global,
  Module,
  type DynamicModule,
  type Provider,
} from "@nestjs/common";

import { IntegrationEventPublisher } from "../../../app/messaging/integration-event-publisher.js";
import type { ProcessRole } from "../../config/app-config.js";
import { PersistenceInfraModule } from "../../persistence/persistence-infra.module.js";
import { InboxProcessor } from "./inbound/inbox/inbox-processor.js";
import { RabbitMqIntegrationEventConsumer } from "./inbound/rabbitmq-integration-event-consumer.js";
import { RabbitMqOutboxPublisher } from "./outbound/outbox/rabbitmq-outbox-publisher.js";
import { TransactionalOutboxIntegrationEventPublisher } from "./outbound/outbox/transactional-outbox-integration-event-publisher.js";
import { RabbitMqConnection } from "./rabbitmq/connection.js";
import { RabbitMqTopologyProvisioner } from "./rabbitmq/topology-provisioner.js";

const publisherProviders: Provider[] = [
  TransactionalOutboxIntegrationEventPublisher,
  {
    provide: IntegrationEventPublisher,
    useExisting: TransactionalOutboxIntegrationEventPublisher,
  },
];

const workerProviders: Provider[] = [
  InboxProcessor,
  RabbitMqConnection,
  RabbitMqTopologyProvisioner,
  RabbitMqIntegrationEventConsumer,
  RabbitMqOutboxPublisher,
];

@Global()
@Module({})
export class IntegrationMessagingInfraModule {
  static register(processRole: ProcessRole): DynamicModule {
    const providers = [
      ...publisherProviders,
      ...(processRole === "worker" ? workerProviders : []),
    ];
    return {
      module: IntegrationMessagingInfraModule,
      imports: [PersistenceInfraModule],
      providers,
      exports: [
        IntegrationEventPublisher,
        ...(processRole === "worker"
          ? [
              InboxProcessor,
              RabbitMqConnection,
              RabbitMqIntegrationEventConsumer,
            ]
          : []),
      ],
    };
  }
}
