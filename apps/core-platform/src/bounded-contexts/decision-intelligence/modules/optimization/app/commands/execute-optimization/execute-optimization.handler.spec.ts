import assert from "node:assert/strict";
import test from "node:test";

import { recommendationAnalysisRequestedV1 } from "@logistics-decision-intelligence/integration-event-contracts";
import {
  IntegrationEventDecoder,
  type CloudEvent,
} from "@logistics-decision-intelligence/integration-events";

import type { DomainEvent } from "../../../../../../../shared/domain/domain-event.js";
import { DomainEventBus } from "../../../../../../../shared/app/messaging/domain-event-bus.js";
import { IntegrationEventPublisher } from "../../../../../../../shared/app/messaging/integration-event-publisher.js";
import { TrxManager } from "../../../../../../../shared/app/trx/trx-manager.js";
import {
  RouteOptimizationInputQuery,
  type RouteOptimizationInput,
} from "../../ports/route-optimization-input.query.js";
import { RouteReference } from "../../../../../domain/route-reference.js";
import { Recommendation } from "../../../../recommendation/domain/recommendation.aggregate.js";
import { RecommendationId } from "../../../../recommendation/domain/recommendation-id.js";
import { RecommendationRepository } from "../../../../recommendation/domain/recommendation.repository.js";
import type { CostMatrix } from "../../../domain/cost-matrix.js";
import { Optimization } from "../../../domain/optimization.aggregate.js";
import { OptimizationCostModel } from "../../../domain/optimization-cost-model.js";
import {
  OptimizationRepository,
  type LoadedOptimization,
} from "../../../domain/optimization.repository.js";
import { RouteOptimizationEvaluator } from "../../../domain/route-optimization-evaluator.js";
import { CostMatrixProvider } from "../../ports/cost-matrix-provider.js";
import {
  RouteOptimizer,
  type RouteOptimizationProblem,
  type RouteOptimizationSolution,
} from "../../ports/route-optimizer.js";
import { ExecuteOptimizationCommand } from "./execute-optimization.command.js";
import { ExecuteOptimizationHandler } from "./execute-optimization.handler.js";

const tenantId = "11111111-1111-4111-8111-111111111111";
const routeId = "22222222-2222-4222-8222-222222222222";

class ImmediateTrxManager extends TrxManager {
  run<TResult>(operation: () => Promise<TResult>): Promise<TResult> {
    return operation();
  }
}

class RecordingDomainEventBus extends DomainEventBus {
  async publish(_event: DomainEvent): Promise<void> {}
}

class RecordingIntegrationEventPublisher extends IntegrationEventPublisher {
  readonly events: CloudEvent[] = [];
  batches = 0;

  async publishMany(events: readonly CloudEvent[]): Promise<void> {
    this.batches += 1;
    this.events.push(...events);
  }
}

class StubOptimizationRepository extends OptimizationRepository {
  constructor(private readonly loaded: LoadedOptimization) {
    super();
  }

  async findById(): Promise<LoadedOptimization> {
    return this.loaded;
  }

  async save(): Promise<string> {
    return "2";
  }

  async findActiveByRouteIdForUpdate(): Promise<null> {
    throw new Error("Not used by this test.");
  }

  async add(): Promise<void> {
    throw new Error("Not used by this test.");
  }

  async delete(): Promise<void> {
    throw new Error("Not used by this test.");
  }
}

class RecordingRecommendationRepository extends RecommendationRepository {
  saved: readonly Recommendation[] = [];

  async addMany(
    _tenantId: string,
    recommendations: readonly Recommendation[],
  ): Promise<void> {
    this.saved = recommendations;
  }

  async findById(_tenantId: string, _id: RecommendationId): Promise<null> {
    throw new Error("Not used by this test.");
  }

  async findPendingByRouteId(): Promise<readonly Recommendation[]> {
    throw new Error("Not used by this test.");
  }

  async findPending(): Promise<readonly Recommendation[]> {
    throw new Error("Not used by this test.");
  }

  async add(): Promise<void> {
    throw new Error("Not used by this test.");
  }

  async save(): Promise<string> {
    throw new Error("Not used by this test.");
  }

  async delete(): Promise<void> {
    throw new Error("Not used by this test.");
  }
}

class StubRouteOptimizationInputQuery extends RouteOptimizationInputQuery {
  async get(): Promise<RouteOptimizationInput> {
    const plannedArrivalAt = new Date("2026-01-01T10:00:00.000Z");
    const plannedDepartureAt = new Date("2026-01-01T10:05:00.000Z");
    return {
      routeId,
      routeVersion: 1,
      fixedOrigin: {
        shipmentId: "33333333-3333-4333-8333-333333333333",
        location: { latitude: 50.45, longitude: 30.52 },
        plannedArrivalAt,
        plannedDepartureAt,
      },
      stops: [
        {
          shipmentId: "44444444-4444-4444-8444-444444444444",
          location: { latitude: 49.84, longitude: 24.03 },
          plannedArrivalAt,
          plannedDepartureAt,
        },
      ],
    };
  }
}

const matrix: CostMatrix = {
  labels: ["origin", "stop"],
  distanceMatrix: [
    [0, 10],
    [10, 0],
  ],
  durationMatrix: [
    [0, 600],
    [600, 0],
  ],
};

class StubCostMatrixProvider extends CostMatrixProvider {
  async compute(): Promise<CostMatrix> {
    return matrix;
  }
}

class StubRouteOptimizer extends RouteOptimizer {
  async optimize(
    _problem: RouteOptimizationProblem,
  ): Promise<RouteOptimizationSolution> {
    return {
      orderedStopIndexes: [0, 1],
      metrics: { distanceKm: 10, durationSeconds: 600 },
    };
  }
}

test("persists an analysis request in the outbox with its recommendation", async () => {
  const optimization = Optimization.queue({
    routeId: RouteReference.from(routeId),
    inputVersion: 1,
  });
  optimization.pullDomainEvents();
  const recommendationRepository = new RecordingRecommendationRepository();
  const integrationEvents = new RecordingIntegrationEventPublisher();
  const handler = new ExecuteOptimizationHandler(
    new StubOptimizationRepository({
      aggregate: optimization,
      expectedRevision: "1",
    }),
    recommendationRepository,
    new StubCostMatrixProvider(),
    new StubRouteOptimizer(),
    new RouteOptimizationEvaluator(OptimizationCostModel.create()),
    new StubRouteOptimizationInputQuery(),
    integrationEvents,
    new ImmediateTrxManager(),
    new RecordingDomainEventBus(),
  );

  await handler.exec(
    new ExecuteOptimizationCommand(tenantId, optimization.id.value),
  );

  const [recommendation] = recommendationRepository.saved;
  assert.ok(recommendation);
  assert.equal(integrationEvents.batches, 1);
  assert.equal(integrationEvents.events.length, 1);
  const event = new IntegrationEventDecoder([
    recommendationAnalysisRequestedV1,
  ]).parse(integrationEvents.events[0]);
  assert.equal(event.tenantid, tenantId);
  assert.equal(event.subject, `recommendation/${recommendation.id.value}`);
  assert.deepEqual(event.data, {
    recommendationId: recommendation.id.value,
    routeId,
  });
});
