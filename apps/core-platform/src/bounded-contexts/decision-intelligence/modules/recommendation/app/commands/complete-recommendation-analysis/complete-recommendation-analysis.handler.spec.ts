import assert from "node:assert/strict";
import test from "node:test";

import { MeasurementUnit } from "../../../../../domain/measurement-unit.enum.js";
import { RecommendationFact } from "../../../../../domain/recommendation-fact.entity.js";
import { RecommendationMetric } from "../../../../../domain/recommendation-metric.enum.js";
import { RecommendationType } from "../../../../../domain/recommendation-type.enum.js";
import { RouteReference } from "../../../../../domain/route-reference.js";
import { RouteStopReference } from "../../../../../domain/route-stop-reference.js";
import type { DomainEvent } from "../../../../../../../shared/domain/domain-event.js";
import { DomainEventBus } from "../../../../../../../shared/app/messaging/domain-event-bus.js";
import { TrxManager } from "../../../../../../../shared/app/trx/trx-manager.js";
import { OptimizationId } from "../../../../optimization/domain/optimization-id.js";
import { ProposedRoutePlan } from "../../../domain/proposed-route-plan.value-object.js";
import { Recommendation } from "../../../domain/recommendation.aggregate.js";
import { FindingCategory } from "../../../domain/recommendation.enums.js";
import {
  RecommendationRepository,
  type LoadedRecommendation,
} from "../../../domain/recommendation.repository.js";
import { CompleteRecommendationAnalysisCommand } from "./complete-recommendation-analysis.command.js";
import { CompleteRecommendationAnalysisHandler } from "./complete-recommendation-analysis.handler.js";

const tenantId = "11111111-1111-4111-8111-111111111111";
const requestEventId = "22222222-2222-4222-8222-222222222222";

class ImmediateTrxManager extends TrxManager {
  run<TResult>(operation: () => Promise<TResult>): Promise<TResult> {
    return operation();
  }
}

class RecordingDomainEventBus extends DomainEventBus {
  readonly events: DomainEvent[] = [];

  async publish(event: DomainEvent): Promise<void> {
    this.events.push(event);
  }
}

class RecordingRecommendationRepository extends RecommendationRepository {
  saves = 0;

  constructor(private readonly loaded: LoadedRecommendation) {
    super();
  }

  async findById(): Promise<LoadedRecommendation> {
    return this.loaded;
  }

  async save(): Promise<string> {
    this.saves += 1;
    return "2";
  }

  async findPendingByRouteId(): Promise<readonly Recommendation[]> {
    return [];
  }

  async findPending(): Promise<readonly Recommendation[]> {
    return [];
  }
  async add(): Promise<void> {}
  async addMany(): Promise<void> {}
  async delete(): Promise<void> {}
}

test("attaches a completed analysis once for its request event", async () => {
  const recommendation = Recommendation.create({
    routeId: RouteReference.from("33333333-3333-4333-8333-333333333333"),
    optimizationId: OptimizationId.from("44444444-4444-4444-8444-444444444444"),
    type: RecommendationType.OptimizeRoutePlan,
    proposedRoutePlan: ProposedRoutePlan.create({
      orderedRouteStopIds: [
        RouteStopReference.from("55555555-5555-4555-8555-555555555555"),
        RouteStopReference.from("66666666-6666-4666-8666-666666666666"),
      ],
    }),
    facts: [
      RecommendationFact.create({
        metric: RecommendationMetric.TotalDistance,
        baselineValue: 100,
        recommendedValue: 90,
        unit: MeasurementUnit.Kilometers,
        improvement: -10,
      }),
    ],
    score: 10,
  });
  recommendation.pullDomainEvents();
  recommendation.requestAnalysis(requestEventId);
  const repository = new RecordingRecommendationRepository({
    aggregate: recommendation,
    expectedRevision: "1",
  });
  const eventBus = new RecordingDomainEventBus();
  const handler = new CompleteRecommendationAnalysisHandler(
    repository,
    new ImmediateTrxManager(),
    eventBus,
  );
  const command = new CompleteRecommendationAnalysisCommand(
    tenantId,
    recommendation.id.value,
    requestEventId,
    {
      summary: "The plan saves distance.",
      confidence: 90,
      findings: [
        {
          category: FindingCategory.Strength,
          title: "Distance",
          description: "Ten kilometres saved.",
        },
      ],
    },
  );

  await handler.exec(command);
  await handler.exec(command);

  assert.equal(recommendation.analysis?.summary, "The plan saves distance.");
  assert.equal(recommendation.analysisStatus, "COMPLETED");
  assert.equal(repository.saves, 1);
  assert.equal(eventBus.events.length, 1);
  assert.equal(
    eventBus.events[0]?.type,
    "RecommendationAnalysisAttachedDomainEvent",
  );
});
