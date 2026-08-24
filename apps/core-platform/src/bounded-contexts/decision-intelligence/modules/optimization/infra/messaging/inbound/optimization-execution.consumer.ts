import { Inject, Injectable } from "@nestjs/common";
import { optimizationJobEnqueuedV1 } from "@logistics-decision-intelligence/integration-event-contracts";

import {
  APP_CONFIG,
  type WorkerAppConfig,
} from "../../../../../../../shared/infra/config/app-config.js";
import { IntegrationJobWorker } from "../../../../../../../shared/infra/messaging/integration/inbound/integration-job-worker.js";
import { RabbitMqIntegrationEventConsumer } from "../../../../../../../shared/infra/messaging/integration/inbound/rabbitmq-integration-event-consumer.js";
import { defineSubscription } from "../../../../../../../shared/infra/messaging/integration/inbound/integration-subscription.js";
import { ExecuteOptimizationCommand } from "../../../app/commands/execute-optimization/execute-optimization.command.js";
import { ExecuteOptimizationHandler } from "../../../app/commands/execute-optimization/execute-optimization.handler.js";

export const OPTIMIZATION_EXECUTION_SUBSCRIPTION = defineSubscription({
  consumerId: "core-platform.decision-intelligence.optimization-executor.v1",
  queue: "core-platform.decision-intelligence.optimization-execution",
  contracts: [optimizationJobEnqueuedV1],
});

@Injectable()
export class OptimizationExecutionConsumer extends IntegrationJobWorker {
  constructor(
    private readonly consumer: RabbitMqIntegrationEventConsumer,
    private readonly executeOptimizationHandler: ExecuteOptimizationHandler,
    @Inject(APP_CONFIG) config: WorkerAppConfig,
  ) {
    super(config);
  }

  protected async subscribe(): Promise<void> {
    await this.consumer.subscribe({
      ...OPTIMIZATION_EXECUTION_SUBSCRIPTION,
      handle: async (event) => {
        const { optimizationId, tenantId } = event.data;
        await this.executeOptimizationHandler.exec(
          new ExecuteOptimizationCommand(tenantId, optimizationId),
        );
      },
    });
  }
}
