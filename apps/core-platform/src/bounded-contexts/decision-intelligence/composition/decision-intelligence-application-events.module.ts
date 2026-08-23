import { Module } from "@nestjs/common";

import { RouteInputChangedHandler } from "../modules/optimization/app/event-handlers/route-input-changed/route-input-changed.handler";
import { OptimizationTriggerModule } from "../modules/optimization/composition/optimization-trigger.module";

/** Registers Decision Intelligence subscriptions to in-process application events. */
@Module({
  imports: [OptimizationTriggerModule],
  providers: [RouteInputChangedHandler],
})
export class DecisionIntelligenceApplicationEventsModule {}
