import { Module } from "@nestjs/common";

import { OptimizationTriggerPolicy } from "../domain/optimization-trigger.policy";
import { RouteOptimizationTriggerPolicy } from "../domain/route-optimization-trigger.policy";
import { OperationalWorkspaceRouteInputModule } from "../infra/operational-workspace/operational-workspace-route-input.module";
import { OptimizationPersistenceModule } from "../infra/persistence/optimization-persistence.module";
import { QueueOptimizationHandler } from "./commands/queue-optimization/queue-optimization.handler";
import { RouteInputChangedHandler } from "./event-handlers/route-input-changed/route-input-changed.handler";

@Module({
  imports: [OptimizationPersistenceModule, OperationalWorkspaceRouteInputModule],
  providers: [
    QueueOptimizationHandler,
    RouteInputChangedHandler,
    {
      provide: OptimizationTriggerPolicy,
      useClass: RouteOptimizationTriggerPolicy,
    },
  ],
  exports: [QueueOptimizationHandler],
})
export class OptimizationQueueAppModule {}
