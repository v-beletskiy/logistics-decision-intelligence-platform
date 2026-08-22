import * as assert from "node:assert/strict";
import { test } from "node:test";

import { RouteReference } from "../../../../../domain/route-reference";
import type { PgDatabase } from "../../../../../../../shared/infra/persistence/pg-database";
import { RecommendationFact } from "../../../../../domain/recommendation-fact.entity";
import { MeasurementUnit } from "../../../../../domain/measurement-unit.enum";
import { RecommendationMetric } from "../../../../../domain/recommendation-metric.enum";
import { RecommendationType } from "../../../../../domain/recommendation-type.enum";
import { OptimizationId } from "../../../../optimization/domain/optimization-id";
import { Recommendation } from "../../../domain/recommendation.aggregate";
import { RecommendationAnalysis } from "../../../domain/recommendation-analysis.value-object";
import { Finding } from "../../../domain/finding.entity";
import { FindingCategory } from "../../../domain/recommendation.enums";
import { reconcileRecommendationFacts } from "./queries/recommendation.reconcile-facts.queries";
import { reconcileRecommendationFindings } from "./queries/recommendation.reconcile-findings.queries";
import { saveRecommendation } from "./queries/recommendation.save.queries";
import { saveRecommendations } from "./queries/recommendation.save-many.queries";
import { PgRecommendationRepository } from "./pg-recommendation.repository";

const tenantId = "00000000-0000-4000-8000-000000000010";

function trackedDatabase(): {
  database: PgDatabase;
  calls: ReadonlyArray<{ statement: unknown; params: unknown }>;
} {
  const calls: Array<{ statement: unknown; params: unknown }> = [];
  const database = {
    exec: async (statement: unknown, params: unknown) => {
      calls.push({ statement, params });
      return [];
    },
    runInTransaction: async <TResult>(operation: () => Promise<TResult>) =>
      operation(),
  } as unknown as PgDatabase;
  return { database, calls };
}

function createRecommendation(): Recommendation {
  const recommendation = Recommendation.create({
    routeId: RouteReference.from("00000000-0000-4000-8000-000000000021"),
    optimizationId: OptimizationId.from("00000000-0000-4000-8000-000000000011"),
    type: RecommendationType.OptimizeRoutePlan,
    facts: [
      RecommendationFact.create({
        metric: RecommendationMetric.TotalDistance,
        baselineValue: 1200,
        recommendedValue: 1050,
        unit: MeasurementUnit.Kilometers,
        improvement: -12.5,
      }),
    ],
    score: 87.5,
  });
  recommendation.attachAnalysis(
    RecommendationAnalysis.create({
      summary: "Recommended plan.",
      confidence: 80,
      findings: [
        Finding.create({
          category: FindingCategory.Strength,
          title: "Shorter route",
          description: "Reduces total distance.",
        }),
      ],
    }),
  );
  return recommendation;
}

test("save persists the root and reconciles facts and findings", async () => {
  const recommendation = createRecommendation();
  const { database, calls } = trackedDatabase();

  await new PgRecommendationRepository(database).save(tenantId, recommendation);

  assert.deepEqual(
    calls.map((call) => call.statement),
    [
      saveRecommendation,
      reconcileRecommendationFacts,
      reconcileRecommendationFindings,
    ],
  );
});

test("save reconciles children using their stable identities", async () => {
  const recommendation = createRecommendation();
  const { database, calls } = trackedDatabase();

  await new PgRecommendationRepository(database).save(tenantId, recommendation);

  const factsParams = calls[1]?.params as { ids: string[] };
  const findingsParams = calls[2]?.params as { ids: string[] };
  assert.deepEqual(
    factsParams.ids,
    recommendation.facts.map((fact) => fact.id.value),
  );
  assert.deepEqual(
    findingsParams.ids,
    recommendation.analysis?.findings.map((finding) => finding.id.value),
  );
});

test("saveMany reconciles children for all recommendations", async () => {
  const recommendations = [createRecommendation(), createRecommendation()];
  const { database, calls } = trackedDatabase();

  await new PgRecommendationRepository(database).saveMany(
    tenantId,
    recommendations,
  );

  assert.deepEqual(
    calls.map((call) => call.statement),
    [
      saveRecommendations,
      reconcileRecommendationFacts,
      reconcileRecommendationFindings,
    ],
  );
  const factsParams = calls[1]?.params as { recommendationIds: string[] };
  assert.deepEqual(
    factsParams.recommendationIds,
    recommendations.map((recommendation) => recommendation.id.value),
  );
});

test("saveMany with no recommendations is a no-op", async () => {
  const { database, calls } = trackedDatabase();

  await new PgRecommendationRepository(database).saveMany(tenantId, []);

  assert.deepEqual(calls, []);
});
