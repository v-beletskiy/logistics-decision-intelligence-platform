import { Module } from "@nestjs/common";

import { DecisionIntelligenceAppModule } from "../../app/decision-intelligence-app.module";
import { OptimizationJobWorker } from "../optimization/messaging/optimization-job.worker";

@Module({
  imports: [DecisionIntelligenceAppModule],
  providers: [OptimizationJobWorker],
})
export class DecisionIntelligenceWorkerModule {}