import { Module } from "@nestjs/common";

import { OptimizationExecutionAppModule } from "../../modules/optimization/app/optimization-execution-app.module";
import { OptimizationExecutionConsumer } from "../../modules/optimization/infra/messaging/inbound/optimization-execution.consumer";

@Module({
  imports: [OptimizationExecutionAppModule],
  providers: [OptimizationExecutionConsumer],
})
export class DecisionIntelligenceWorkerModule {}
