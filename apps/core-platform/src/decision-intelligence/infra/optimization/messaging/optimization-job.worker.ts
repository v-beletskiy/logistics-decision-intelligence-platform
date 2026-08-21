import { Inject, Injectable } from "@nestjs/common";
import { optimizationJobEnqueuedV1 } from "@logistics-decision-intelligence/integration-contracts";

import { APP_CONFIG, type AppConfig } from "../../../../shared/infra/config/app-config";
import { IntegrationJobWorker } from "../../../../shared/infra/messaging/integration/inbound/integration-job-worker";
import { RabbitMqIntegrationEventConsumer } from "../../../../shared/infra/messaging/integration/inbound/rabbitmq-integration-event-consumer";
import { integrationSubscriptionIdentity } from "../../../../shared/infra/messaging/integration/inbound/subscription-identity";
import { ExecuteOptimizationCommand } from "../../../app/optimization/commands/execute-optimization/execute-optimization.command";
import { ExecuteOptimizationHandler } from "../../../app/optimization/commands/execute-optimization/execute-optimization.handler";

const OPTIMIZATION_JOB_QUEUE = "decision-intelligence.optimization-job";

@Injectable()
export class OptimizationJobWorker extends IntegrationJobWorker {
  constructor(
    private readonly consumer: RabbitMqIntegrationEventConsumer,
    private readonly executeOptimizationHandler: ExecuteOptimizationHandler,
    @Inject(APP_CONFIG) config: AppConfig,
  ) {
    super(config);
  }

  protected async subscribe(): Promise<void> {
    const identity = integrationSubscriptionIdentity({
      consumerId: OPTIMIZATION_JOB_QUEUE,
      queue: OPTIMIZATION_JOB_QUEUE,
    });
    await this.consumer.subscribe({
      consumerId: identity.consumerId,
      queue: identity.queue,
      eventContracts: [optimizationJobEnqueuedV1],
      handle: async (event) => {
        const { optimizationId, tenantId } = event.data;
        await this.executeOptimizationHandler.execute(
          new ExecuteOptimizationCommand(tenantId, optimizationId),
        );
      },
    });
  }
}