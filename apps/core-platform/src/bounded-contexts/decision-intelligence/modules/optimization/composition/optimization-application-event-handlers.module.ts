import { Module } from "@nestjs/common";

import { QueueOptimizationHandler } from "../app/commands/queue-optimization/queue-optimization.handler.js";
import { RouteInputChangedHandler } from "../app/event-handlers/route-input-changed/route-input-changed.handler.js";
import { OptimizationTriggerPolicy } from "../domain/optimization-trigger.policy.js";
import { RouteOptimizationTriggerPolicy } from "../domain/route-optimization-trigger.policy.js";
import { OperationalWorkspaceRouteInputModule } from "../infra/operational-workspace/operational-workspace-route-input.module.js";
import { OptimizationPersistenceModule } from "../infra/persistence/optimization-persistence.module.js";

@Module({
  imports: [
    OptimizationPersistenceModule,
    OperationalWorkspaceRouteInputModule,
  ],
  providers: [
    QueueOptimizationHandler,
    RouteInputChangedHandler,
    {
      provide: OptimizationTriggerPolicy,
      useClass: RouteOptimizationTriggerPolicy,
    },
  ],
})
export class OptimizationApplicationEventHandlersModule {}
