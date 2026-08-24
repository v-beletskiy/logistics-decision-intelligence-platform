import * as assert from "node:assert/strict";
import { test } from "node:test";

import { AggregateNotFoundException } from "../../../../../../shared/app/app.exceptions.js";
import type {
  GetRecommendationAnalysisContextRequest,
  GetRecommendationAnalysisContextResponse,
} from "../../../../../../shared/infra/grpc/generated/decision_intelligence/v1/recommendation_analysis_service.js";
import { GrpcServiceRegistry } from "../../../../../../shared/infra/grpc/grpc-service-registry.js";
import { RecommendationMetric } from "../../../../domain/recommendation-metric.enum.js";
import { RecommendationType } from "../../../../domain/recommendation-type.enum.js";
import { MeasurementUnit } from "../../../../domain/measurement-unit.enum.js";
import { RecommendationStatus } from "../../domain/recommendation.enums.js";
import type { GetRecommendationAnalysisContextHandler } from "../../app/queries/get-recommendation-analysis-context/get-recommendation-analysis-context.handler.js";
import type { RecommendationAnalysisContextResult } from "../../app/queries/get-recommendation-analysis-context/get-recommendation-analysis-context.result.js";
import { RecommendationAnalysisGrpcController } from "./recommendation-analysis.grpc-controller.js";

const context: RecommendationAnalysisContextResult = {
  recommendationId: "00000000-0000-4000-8000-000000000001",
  routeId: "00000000-0000-4000-8000-000000000011",
  type: RecommendationType.AssignVehicle,
  status: RecommendationStatus.Pending,
  score: 90,
  proposedRouteStopIds: ["00000000-0000-4000-8000-000000000012"],
  facts: [
    {
      metric: RecommendationMetric.TotalDistance,
      baselineValue: 1200,
      recommendedValue: 1050,
      unit: MeasurementUnit.Kilometers,
      improvement: -12.5,
    },
  ],
};

function handlerReturning(
  outcome: RecommendationAnalysisContextResult | Error,
): GetRecommendationAnalysisContextHandler {
  return {
    exec: () =>
      outcome instanceof Error
        ? Promise.reject(outcome)
        : Promise.resolve(outcome),
  } as unknown as GetRecommendationAnalysisContextHandler;
}

function controllerWith(
  outcome: RecommendationAnalysisContextResult | Error,
): RecommendationAnalysisGrpcController {
  return new RecommendationAnalysisGrpcController(
    handlerReturning(outcome),
    new GrpcServiceRegistry(),
  );
}

function invoke(
  controller: RecommendationAnalysisGrpcController,
  request: GetRecommendationAnalysisContextRequest,
): Promise<{
  error: { code?: number } | null;
  response: GetRecommendationAnalysisContextResponse | null | undefined;
}> {
  return new Promise((resolve) => {
    controller.handlers.getRecommendationAnalysisContext(
      { request } as never,
      (error, response) =>
        resolve({
          error: (error as { code?: number } | null) ?? null,
          response,
        }),
    );
  });
}

test("RecommendationAnalysisGrpcController maps a loaded recommendation", async () => {
  const controller = controllerWith(context);
  const { error, response } = await invoke(controller, {
    tenantId: "00000000-0000-4000-8000-000000000010",
    recommendationId: context.recommendationId,
  });

  assert.equal(error, null);
  assert.equal(response?.recommendation?.id, context.recommendationId);
  assert.equal(response?.recommendation?.routeId, context.routeId);
  assert.equal(response?.recommendation?.type, "ASSIGN_VEHICLE");
  assert.equal(response?.recommendation?.score, 90);
  assert.equal(response?.recommendation?.facts.length, 1);
  assert.deepEqual(response?.recommendation?.facts[0], {
    metric: "TOTAL_DISTANCE",
    baselineValue: 1200,
    recommendedValue: 1050,
    unit: "KILOMETERS",
    improvement: -12.5,
  });
});

test("RecommendationAnalysisGrpcController propagates handler errors", async () => {
  const controller = controllerWith(
    new AggregateNotFoundException("Recommendation"),
  );
  const invoke = controller.handlers
    .getRecommendationAnalysisContext as unknown as (
    call: { request: GetRecommendationAnalysisContextRequest },
    callback: (error: unknown, response: unknown) => void,
  ) => Promise<void>;

  await assert.rejects(
    invoke(
      {
        request: {
          tenantId: "00000000-0000-4000-8000-000000000010",
          recommendationId: "00000000-0000-4000-8000-000000000099",
        },
      },
      () => undefined,
    ),
    (error: unknown) => error instanceof AggregateNotFoundException,
  );
});
