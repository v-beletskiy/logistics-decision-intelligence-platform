import { Module } from "@nestjs/common";

import { QueueOptimizationHandler } from "../app/commands/queue-optimization/queue-optimization.handler";
import { RouteInputChangedHandler } from "../app/event-handlers/route-input-changed/route-input-changed.handler";
import { OptimizationTriggerPolicy } from "../domain/optimization-trigger.policy";
import { RouteOptimizationTriggerPolicy } from "../domain/route-optimization-trigger.policy";
import { OperationalWorkspaceRouteInputModule } from "../infra/operational-workspace/operational-workspace-route-input.module";
import { OptimizationPersistenceModule } from "../infra/persistence/optimization-persistence.module";

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
