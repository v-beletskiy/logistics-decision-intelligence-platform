import { Module } from "@nestjs/common";

import { OptimizationWorkerModule } from "../modules/optimization/composition/optimization-worker.module";
import { OptimizationExecutionConsumer } from "../modules/optimization/infra/messaging/inbound/optimization-execution.consumer";

@Module({
  imports: [OptimizationWorkerModule],
  providers: [OptimizationExecutionConsumer],
})
export class DecisionIntelligenceWorkerModule {}
