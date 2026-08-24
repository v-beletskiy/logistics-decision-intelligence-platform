import { Injectable } from "@nestjs/common";
import { recommendationAnalysisRequestedV1 } from "@logistics-decision-intelligence/integration-event-contracts";

import { AggregateNotFoundException } from "../../../../../../../shared/app/app.exceptions.js";
import {
  CommandHandler,
  type DomainEventsSource,
} from "../../../../../../../shared/app/handlers/command-handler.js";
import { DomainEventBus } from "../../../../../../../shared/app/messaging/domain-event-bus.js";
import { IntegrationEventPublisher } from "../../../../../../../shared/app/messaging/integration-event-publisher.js";
import { TrxManager } from "../../../../../../../shared/app/trx/trx-manager.js";
import { decisionIntelligenceIntegrationEventFactory } from "../../../../../app/decision-intelligence-integration-events.js";
import { OptimizationId } from "../../../domain/optimization-id.js";
import { OptimizationStatus } from "../../../domain/optimization.aggregate.js";
import { OptimizationRepository } from "../../../domain/optimization.repository.js";
import { RouteOptimizationEvaluator } from "../../../domain/route-optimization-evaluator.js";
import { Recommendation } from "../../../../recommendation/domain/recommendation.aggregate.js";
import { RecommendationRepository } from "../../../../recommendation/domain/recommendation.repository.js";
import { RecommendationType } from "../../../../../domain/recommendation-type.enum.js";
import { RecommendationMetric } from "../../../../../domain/recommendation-metric.enum.js";
import { MeasurementUnit } from "../../../../../domain/measurement-unit.enum.js";
import { RecommendationFact } from "../../../../../domain/recommendation-fact.entity.js";
import { CandidateRecommendation } from "../../../domain/candidate-recommendation.value-object.js";
import { RouteStopReference } from "../../../../../domain/route-stop-reference.js";
import { ProposedRoutePlan } from "../../../../recommendation/domain/proposed-route-plan.value-object.js";
import { CostMatrixProvider } from "../../ports/cost-matrix-provider.js";
import { RouteOptimizationInputQuery } from "../../ports/route-optimization-input.query.js";
import { RouteOptimizer } from "../../ports/route-optimizer.js";
import { ExecuteOptimizationCommand } from "./execute-optimization.command.js";

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
      await this.failIfQueued(command.tenantId, optimizationId);
      return;
    }
    if (input.routeVersion !== loaded.aggregate.inputVersion) {
      await this.cancelIfQueued(command.tenantId, optimizationId);
      return;
    }

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
    const candidate =
      evaluation.score > 0
        ? CandidateRecommendation.create({
            routeId: loaded.aggregate.routeId,
            type: RecommendationType.OptimizeRoutePlan,
            proposedRoutePlan: ProposedRoutePlan.create({
              orderedRouteStopIds: solution.orderedStopIndexes.map((index) =>
                RouteStopReference.from(optimizationStops[index]?.routeStopId),
              ),
            }),
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
          })
        : undefined;

    await this.execUseCaseTrx(async () => {
      const current = await this.optimizationRepository.findById(
        command.tenantId,
        optimizationId,
      );
      if (!current || current.aggregate.status !== OptimizationStatus.Queued) {
        return { result: undefined, eventsFrom: [] };
      }
      const currentInput = await this.routeInputQuery.get(
        command.tenantId,
        current.aggregate.routeId.value,
      );
      if (!currentInput) {
        current.aggregate.fail();
        await this.optimizationRepository.save(command.tenantId, current);
        return { result: undefined, eventsFrom: [current.aggregate] };
      }
      if (currentInput.routeVersion !== current.aggregate.inputVersion) {
        current.aggregate.cancel();
        await this.optimizationRepository.save(command.tenantId, current);
        return { result: undefined, eventsFrom: [current.aggregate] };
      }

      const optimization = current.aggregate;
      optimization.start(currentInput.routeVersion);

      const recommendations = candidate
        ? [
            Recommendation.create({
              routeId: candidate.routeId,
              optimizationId: optimization.id,
              type: candidate.type,
              proposedRoutePlan: candidate.proposedRoutePlan,
              facts: candidate.facts,
              score: candidate.score,
            }),
          ]
        : [];
      await this.recommendationRepository.addMany(
        command.tenantId,
        recommendations,
      );

      if (recommendations.length > 0) {
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
      }

      optimization.complete();
      await this.optimizationRepository.save(command.tenantId, current);

      return {
        result: undefined,
        eventsFrom: [optimization, ...recommendations] satisfies DomainEventsSource[],
      };
    });
  }

  private async failIfQueued(
    tenantId: string,
    optimizationId: OptimizationId,
  ): Promise<void> {
    await this.execUseCaseTrx(async () => {
      const loaded = await this.optimizationRepository.findById(
        tenantId,
        optimizationId,
      );
      if (!loaded || loaded.aggregate.status !== OptimizationStatus.Queued) {
        return { result: undefined, eventsFrom: [] };
      }
      loaded.aggregate.fail();
      await this.optimizationRepository.save(tenantId, loaded);
      return { result: undefined, eventsFrom: [loaded.aggregate] };
    });
  }

  private async cancelIfQueued(
    tenantId: string,
    optimizationId: OptimizationId,
  ): Promise<void> {
    await this.execUseCaseTrx(async () => {
      const loaded = await this.optimizationRepository.findById(
        tenantId,
        optimizationId,
      );
      if (!loaded || loaded.aggregate.status !== OptimizationStatus.Queued) {
        return { result: undefined, eventsFrom: [] };
      }
      loaded.aggregate.cancel();
      await this.optimizationRepository.save(tenantId, loaded);
      return { result: undefined, eventsFrom: [loaded.aggregate] };
    });
  }
}
