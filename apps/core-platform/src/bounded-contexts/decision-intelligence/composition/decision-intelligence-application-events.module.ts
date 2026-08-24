import { Module } from "@nestjs/common";

import { OptimizationApplicationEventHandlersModule } from "../modules/optimization/composition/optimization-application-event-handlers.module.js";

/** Registers Decision Intelligence subscriptions to in-process application events. */
@Module({
  imports: [OptimizationApplicationEventHandlersModule],
})
export class DecisionIntelligenceApplicationEventsModule {}
