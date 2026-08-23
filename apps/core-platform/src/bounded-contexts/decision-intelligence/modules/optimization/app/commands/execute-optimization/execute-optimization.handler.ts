import { Injectable } from "@nestjs/common";
import { recommendationAnalysisRequestedV1 } from "@logistics-decision-intelligence/integration-event-contracts";

import { AggregateNotFoundException } from "../../../../../../../shared/app/app.exceptions";
import {
  CommandHandler,
  type DomainEventsSource,
} from "../../../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../../../shared/app/messaging/domain-event-bus";
import { IntegrationEventPublisher } from "../../../../../../../shared/app/messaging/integration-event-publisher";
import { TrxManager } from "../../../../../../../shared/app/trx/trx-manager";
import { decisionIntelligenceIntegrationEventFactory } from "../../../../../app/decision-intelligence-integration-events";
import { OptimizationId } from "../../../domain/optimization-id";
import {
  Optimization,
  OptimizationStatus,
} from "../../../domain/optimization.aggregate";
import { OptimizationRepository } from "../../../domain/optimization.repository";
import { RouteOptimizationEvaluator } from "../../../domain/route-optimization-evaluator";
import { Recommendation } from "../../../../recommendation/domain/recommendation.aggregate";
import { RecommendationRepository } from "../../../../recommendation/domain/recommendation.repository";
import { RecommendationType } from "../../../../../domain/recommendation-type.enum";
import { RecommendationMetric } from "../../../../../domain/recommendation-metric.enum";
import { MeasurementUnit } from "../../../../../domain/measurement-unit.enum";
import { RecommendationFact } from "../../../../../domain/recommendation-fact.entity";
import { CandidateRecommendation } from "../../../domain/candidate-recommendation.value-object";
import { CostMatrixProvider } from "../../ports/cost-matrix-provider";
import { RouteOptimizationInputQuery } from "../../ports/route-optimization-input.query";
import { RouteOptimizer } from "../../ports/route-optimizer";
import { ExecuteOptimizationCommand } from "./execute-optimization.command";

@Injectable()
export class ExecuteOptimizationHandler extends CommandHandler {
  constructor(
    private readonly optimizationRepository: OptimizationRepository,
    private readonly recommendationRepository: RecommendationRepository,
    private readonly matrixProvider: CostMatrixProvider,
    private readonly routeOptimizer: RouteOptimizer,
    private readonly evaluator: RouteOptimizationEvaluator,
    private readonly routeInputQuery: RouteOptimizationInputQuery,
    private readonly integrationEventPublisher: IntegrationEventPublisher,
    trxManager: TrxManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  async exec(command: ExecuteOptimizationCommand): Promise<void> {
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

    const input = await this.routeInputQuery.get(
      command.tenantId,
      loaded.aggregate.routeId.value,
    );
    if (!input) {
      await this.fail(command.tenantId, loaded);
      return;
    }

    let recommendation;
    try {
      const optimizationStops = [input.fixedOrigin, ...input.stops];
      const matrix = await this.matrixProvider.compute(
        optimizationStops.map((stop) => stop.location),
      );
      const solution = await this.routeOptimizer.optimize({
        fixedOrigin: input.fixedOrigin,
        stops: input.stops,
        matrix,
      });
      const evaluation = this.evaluator.evaluate({
        stops: optimizationStops,
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
      await this.recommendationRepository.addMany(
        command.tenantId,
        recommendations,
      );

      await this.integrationEventPublisher.publishMany(
        recommendations.map((persistedRecommendation) =>
          decisionIntelligenceIntegrationEventFactory.create(
            recommendationAnalysisRequestedV1,
            {
              tenantid: command.tenantId,
              subject: `recommendation/${persistedRecommendation.id.value}`,
              data: {
                recommendationId: persistedRecommendation.id.value,
                routeId: persistedRecommendation.routeId.value,
              },
            },
          ),
        ),
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
