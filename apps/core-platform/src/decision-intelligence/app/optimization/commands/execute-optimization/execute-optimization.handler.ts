import { Injectable } from "@nestjs/common";

import { RouteOptimizationInputReadContract } from "../../../../../operational-workspace/contracts/reads/route-optimization-input.read-contract";
import { AggregateNotFoundException } from "../../../../../shared/app/app.exceptions";
import {
  CommandHandler,
  type DomainEventsSource,
} from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { OptimizationId } from "../../../../domain-modules/optimization/domain/optimization-id";
import {
  Optimization,
  OptimizationStatus,
} from "../../../../domain-modules/optimization/domain/optimization.aggregate";
import { OptimizationRepository } from "../../../../domain-modules/optimization/domain/optimization.repository";
import { RouteOptimizationEvaluator } from "../../../../domain-modules/optimization/domain/route-optimization-evaluator";
import { Recommendation } from "../../../../domain-modules/recommendation/domain/recommendation.aggregate";
import { RecommendationRepository } from "../../../../domain-modules/recommendation/domain/recommendation.repository";
import { RecommendationType } from "../../../../shared-domain/shared-kernel/enums/recommendation-type.enum";
import { RecommendationMetric } from "../../../../shared-domain/shared-kernel/enums/recommendation-metric.enum";
import { MeasurementUnit } from "../../../../shared-domain/shared-kernel/enums/measurement-unit.enum";
import { RecommendationFact } from "../../../../shared-domain/shared-kernel/entities/recommendation-fact.entity";
import { CandidateRecommendation } from "../../../../domain-modules/optimization/domain/candidate-recommendation.value-object";
import { CostMatrixProvider } from "../../ports/cost-matrix-provider.port";
import { RouteOptimizer } from "../../ports/route-optimizer.port";
import { ExecuteOptimizationCommand } from "./execute-optimization.command";

@Injectable()
export class ExecuteOptimizationHandler extends CommandHandler {
  constructor(
    private readonly optimizationRepository: OptimizationRepository,
    private readonly recommendationRepository: RecommendationRepository,
    private readonly matrixProvider: CostMatrixProvider,
    private readonly routeOptimizer: RouteOptimizer,
    private readonly evaluator: RouteOptimizationEvaluator,
    private readonly routeInputReadContract: RouteOptimizationInputReadContract,
    transactionManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(transactionManager, domainEventBus);
  }

  async execute(command: ExecuteOptimizationCommand): Promise<void> {
    const optimizationId = OptimizationId.from(command.optimizationId);
    const loaded = await this.optimizationRepository.findById(
      command.tenantId,
      optimizationId,
    );
    if (!loaded) {
      throw new AggregateNotFoundException("Optimization");
    }
    if (loaded.aggregate.status !== OptimizationStatus.Queued) {
      return;
    }

    const input = await this.routeInputReadContract.get(
      command.tenantId,
      loaded.aggregate.routeId.value,
    );
    if (!input) {
      await this.fail(command.tenantId, loaded);
      return;
    }

    let recommendation;
    try {
      const matrix = await this.matrixProvider.compute(
        input.stops.map((stop) => stop.location),
      );
      const solution = await this.routeOptimizer.optimize({
        stops: input.stops,
        matrix,
      });
      const evaluation = this.evaluator.evaluate({
        stops: input.stops,
        matrix,
        orderedStopIndexes: solution.orderedStopIndexes,
      });
      recommendation = CandidateRecommendation.create({
        routeId: loaded.aggregate.routeId,
        type: RecommendationType.OptimizeRoutePlan,
        facts: [
          RecommendationFact.create({
            metric: RecommendationMetric.TotalDistance,
            baselineValue: evaluation.baseline.distanceKm,
            recommendedValue: evaluation.recommended.distanceKm,
            unit: MeasurementUnit.Kilometers,
            improvement: evaluation.distanceImprovementPercent,
          }),
          RecommendationFact.create({
            metric: RecommendationMetric.TotalDuration,
            baselineValue: evaluation.baseline.durationSeconds,
            recommendedValue: evaluation.recommended.durationSeconds,
            unit: MeasurementUnit.Seconds,
            improvement: evaluation.durationImprovementPercent,
          }),
        ],
        score: evaluation.score,
      });
    } catch {
      await this.fail(command.tenantId, loaded);
      return;
    }

    await this.execUseCaseTrx(async () => {
      const optimization = loaded.aggregate;
      optimization.start(input.routeVersion);

      const recommendations = [
        Recommendation.create({
          routeId: recommendation.routeId,
          optimizationId: optimization.id,
          type: recommendation.type,
          facts: recommendation.facts,
          score: recommendation.score,
        }),
      ];
      await this.recommendationRepository.saveMany(
        command.tenantId,
        recommendations,
      );

      optimization.complete();
      await this.optimizationRepository.save(command.tenantId, loaded);

      return {
        result: undefined,
        eventsFrom: [optimization, ...recommendations] as DomainEventsSource[],
      };
    });
  }

  private async fail(
    tenantId: string,
    loaded: { aggregate: Optimization; expectedRevision: string },
  ): Promise<void> {
    loaded.aggregate.fail();
    await this.execUseCaseTrx(async () => {
      await this.optimizationRepository.save(tenantId, loaded);
      return { result: undefined, eventsFrom: [loaded.aggregate] };
    });
  }
}
