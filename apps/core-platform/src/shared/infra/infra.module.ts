import {
  Global,
  Module,
  type DynamicModule,
  type Provider,
} from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";

import type { ProcessRole } from "./config/app-config";
import { GrpcClientFactory } from "./grpc/grpc-client.factory";
import { HealthController } from "./http/health.controller";
import { HttpExceptionFilter } from "./http/http-exception.filter";
import {
  DistributedApplicationEventBus,
  InternalApplicationEventBus,
} from "./messaging/application-event-bus";
import { InMemoryApplicationEventBus } from "./messaging/in-memory-application-event-bus";
import { DomainEventBus } from "./messaging/domain-event-bus";
import { InMemoryDomainEventBus } from "./messaging/in-memory-domain-event-bus";
import { IntegrationEventMetadataFactory } from "./messaging/integration-event.factory";
import { RabbitMqConnection } from "./messaging/rabbitmq-connection";
import { RabbitMqIntegrationEventConsumer } from "./messaging/rabbitmq-integration-event-consumer";
import { RabbitMqTopologyProvisioner } from "./messaging/rabbitmq-topology-provisioner";
import { InboxProcessor } from "./inbox-outbox/inbox-processor";
import { InboxStore } from "./inbox-outbox/inbox-store";
import { OutboxStore } from "./inbox-outbox/outbox-store";
import { PgInboxStore } from "./inbox-outbox/pg-inbox-store";
import { PgOutboxStore } from "./inbox-outbox/pg-outbox-store";
import { RabbitMqOutboxPublisher } from "./inbox-outbox/rabbitmq-outbox-publisher";
import { TransactionalOutboxApplicationEventBus } from "./inbox-outbox/transactional-outbox-application-event-bus";
import { PgDatabase } from "./persistence/pg-database";
import { PgTransactionManager } from "./persistence/pg-transaction-manager";
import { TransactionManager } from "./persistence/transaction-manager";

@Global()
@Module({})
export class InfraModule {
  static register(processRoles: readonly ProcessRole[]): DynamicModule {
    const isApi = processRoles.includes("api");
    const isOutboxPublisher = processRoles.includes("outbox-publisher");
    const providers: Provider[] = [
      PgDatabase,
      ...(isApi ? [HttpExceptionFilter] : []),
      InMemoryApplicationEventBus,
      InMemoryDomainEventBus,
      {
        provide: DomainEventBus,
        useExisting: InMemoryDomainEventBus,
      },
      {
        provide: InternalApplicationEventBus,
        useExisting: InMemoryApplicationEventBus,
      },
      IntegrationEventMetadataFactory,
      TransactionalOutboxApplicationEventBus,
      {
        provide: DistributedApplicationEventBus,
        useExisting: TransactionalOutboxApplicationEventBus,
      },
      {
        provide: TransactionManager,
        useClass: PgTransactionManager,
      },
      {
        provide: OutboxStore,
        useClass: PgOutboxStore,
      },
      {
        provide: InboxStore,
        useClass: PgInboxStore,
      },
      InboxProcessor,
      RabbitMqConnection,
      RabbitMqTopologyProvisioner,
      RabbitMqIntegrationEventConsumer,
      ...(isOutboxPublisher ? [RabbitMqOutboxPublisher] : []),
      GrpcClientFactory,
    ];

    return {
      module: InfraModule,
      imports: [EventEmitterModule.forRoot()],
      controllers: isApi ? [HealthController] : [],
      providers,
      exports: [
        InternalApplicationEventBus,
        DomainEventBus,
        DistributedApplicationEventBus,
        IntegrationEventMetadataFactory,
        TransactionManager,
        PgDatabase,
        OutboxStore,
        InboxProcessor,
        RabbitMqConnection,
        RabbitMqIntegrationEventConsumer,
        GrpcClientFactory,
      ],
    };
  }
}
