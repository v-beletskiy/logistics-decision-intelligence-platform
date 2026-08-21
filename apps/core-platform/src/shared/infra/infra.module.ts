import {
  Global,
  Module,
  type DynamicModule,
  type Provider,
} from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";

import { DomainEventBus } from "../app/messaging/domain-event-bus";
import { IntegrationEventPublisher } from "../app/messaging/integration-event-publisher";
import { InternalApplicationEventBus } from "../app/messaging/internal-application-event-bus";
import type { ProcessRole } from "./config/app-config";
import { GrpcClientFactory } from "./grpc/grpc-client.factory";
import { GrpcServiceRegistry } from "./grpc/grpc-service-registry";
import { GrpcServer } from "./grpc/grpc-server";
import { HealthController } from "./http/health.controller";
import { HttpExceptionFilter } from "./http/http-exception.filter";
import { InboxProcessor } from "./messaging/integration/inbound/inbox/inbox-processor";
import { InboxStore } from "./messaging/integration/inbound/inbox/inbox-store";
import { PgInboxStore } from "./messaging/integration/inbound/inbox/pg-inbox-store";
import { RabbitMqIntegrationEventConsumer } from "./messaging/integration/inbound/rabbitmq-integration-event-consumer";
import { OutboxStore } from "./messaging/integration/outbound/outbox/outbox-store";
import { PgOutboxStore } from "./messaging/integration/outbound/outbox/pg-outbox-store";
import { RabbitMqOutboxPublisher } from "./messaging/integration/outbound/outbox/rabbitmq-outbox-publisher";
import { TransactionalOutboxIntegrationEventPublisher } from "./messaging/integration/outbound/outbox/transactional-outbox-integration-event-publisher";
import { RabbitMqConnection } from "./messaging/integration/rabbitmq/connection";
import { RabbitMqTopologyProvisioner } from "./messaging/integration/rabbitmq/topology-provisioner";
import { InMemoryApplicationEventBus } from "./messaging/internal/in-memory-application-event-bus";
import { InMemoryDomainEventBus } from "./messaging/internal/in-memory-domain-event-bus";
import { PgDatabase } from "./persistence/pg-database";
import { PgTransactionManager } from "./persistence/pg-transaction-manager";
import { TransactionManager } from "./persistence/transaction-manager";

@Global()
@Module({})
export class InfraModule {
  static register(processRoles: readonly ProcessRole[]): DynamicModule {
    const isApi = processRoles.includes("api");
    const isWorker = processRoles.includes("worker");
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
      TransactionalOutboxIntegrationEventPublisher,
      {
        provide: IntegrationEventPublisher,
        useExisting: TransactionalOutboxIntegrationEventPublisher,
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
      ...(isWorker ? [RabbitMqOutboxPublisher] : []),
      GrpcClientFactory,
      GrpcServiceRegistry,
      ...(isApi ? [GrpcServer] : []),
    ];

    return {
      module: InfraModule,
      imports: [EventEmitterModule.forRoot()],
      controllers: isApi ? [HealthController] : [],
      providers,
      exports: [
        InternalApplicationEventBus,
        DomainEventBus,
        IntegrationEventPublisher,
        TransactionManager,
        PgDatabase,
        OutboxStore,
        InboxProcessor,
        RabbitMqConnection,
        RabbitMqIntegrationEventConsumer,
        GrpcClientFactory,
        GrpcServiceRegistry,
        ...(isApi ? [GrpcServer] : []),
      ],
    };
  }
}
