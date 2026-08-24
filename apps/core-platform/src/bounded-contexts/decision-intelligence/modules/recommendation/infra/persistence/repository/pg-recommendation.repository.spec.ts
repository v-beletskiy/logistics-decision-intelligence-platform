import * as assert from "node:assert/strict";
import { test } from "node:test";

import { RouteReference } from "../../../../../domain/route-reference.js";
import { RouteStopReference } from "../../../../../domain/route-stop-reference.js";
import { ConcurrencyConflictException } from "../../../../../../../shared/app/app.exceptions.js";
import type { PgDatabase } from "../../../../../../../shared/infra/persistence/pg-database.js";
import { RecommendationFact } from "../../../../../domain/recommendation-fact.entity.js";
import { MeasurementUnit } from "../../../../../domain/measurement-unit.enum.js";
import { RecommendationMetric } from "../../../../../domain/recommendation-metric.enum.js";
import { RecommendationType } from "../../../../../domain/recommendation-type.enum.js";
import { OptimizationId } from "../../../../optimization/domain/optimization-id.js";
import { Finding } from "../../../domain/finding.entity.js";
import { RecommendationAnalysis } from "../../../domain/recommendation-analysis.value-object.js";
import { Recommendation } from "../../../domain/recommendation.aggregate.js";
import { ProposedRoutePlan } from "../../../domain/proposed-route-plan.value-object.js";
import { FindingCategory } from "../../../domain/recommendation.enums.js";
import type { LoadedRecommendation } from "../../../domain/recommendation.repository.js";
import { addRecommendations } from "./queries/recommendation.add-many.queries.js";
import { addRecommendation } from "./queries/recommendation.add.queries.js";
import { addRecommendationRoutePlanStops } from "./queries/recommendation.add-route-plan-stops.queries.js";
import { reconcileRecommendationFacts } from "./queries/recommendation.reconcile-facts.queries.js";
import { reconcileRecommendationFindings } from "./queries/recommendation.reconcile-findings.queries.js";
import { updateRecommendation } from "./queries/recommendation.update.queries.js";
import { PgRecommendationRepository } from "./pg-recommendation.repository.js";

const tenantId = "00000000-0000-4000-8000-000000000010";

function trackedDatabase(options: { updateSucceeds?: boolean } = {}): {
  database: PgDatabase;
  calls: ReadonlyArray<{ statement: unknown; params: unknown }>;
} {
  const calls: Array<{ statement: unknown; params: unknown }> = [];
  const database = {
    exec: async (statement: unknown, params: unknown) => {
      calls.push({ statement, params });
      if (statement === updateRecommendation) {
        return options.updateSucceeds === false ? [] : [{ revision: "8" }];
      }
      return [];
    },
  } as unknown as PgDatabase;
  return { database, calls };
}

function createRecommendation(): Recommendation {
  const recommendation = Recommendation.create({
    routeId: RouteReference.from("00000000-0000-4000-8000-000000000021"),
    optimizationId: OptimizationId.from("00000000-0000-4000-8000-000000000011"),
    type: RecommendationType.OptimizeRoutePlan,
    proposedRoutePlan: ProposedRoutePlan.create({
      orderedRouteStopIds: [
        RouteStopReference.from("00000000-0000-4000-8000-000000000031"),
        RouteStopReference.from("00000000-0000-4000-8000-000000000032"),
      ],
    }),
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
  const requestEventId = "00000000-0000-4000-8000-000000000041";
  recommendation.requestAnalysis(requestEventId);
  recommendation.attachAnalysis(
    requestEventId,
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

function loadedRecommendation(): LoadedRecommendation {
  return { aggregate: createRecommendation(), expectedRevision: "7" };
}

test("add inserts the root and reconciles facts and findings", async () => {
  const recommendation = createRecommendation();
  const { database, calls } = trackedDatabase();

  await new PgRecommendationRepository(database).add(tenantId, recommendation);

  assert.deepEqual(
    calls.map((call) => call.statement),
    [
      addRecommendation,
      addRecommendationRoutePlanStops,
      reconcileRecommendationFacts,
      reconcileRecommendationFindings,
    ],
  );
});

test("add reconciles children using their stable identities", async () => {
  const recommendation = createRecommendation();
  const { database, calls } = trackedDatabase();

  await new PgRecommendationRepository(database).add(tenantId, recommendation);

  const factsParams = calls[2]?.params as { ids: string[] };
  const findingsParams = calls[3]?.params as { ids: string[] };
  assert.deepEqual(
    factsParams.ids,
    recommendation.facts.map((fact) => fact.id.value),
  );
  assert.deepEqual(
    findingsParams.ids,
    recommendation.analysis?.findings.map((finding) => finding.id.value),
  );
});

test("addMany inserts and reconciles all recommendations", async () => {
  const recommendations = [createRecommendation(), createRecommendation()];
  const { database, calls } = trackedDatabase();

  await new PgRecommendationRepository(database).addMany(
    tenantId,
    recommendations,
  );

  assert.deepEqual(
    calls.map((call) => call.statement),
    [
      addRecommendations,
      addRecommendationRoutePlanStops,
      reconcileRecommendationFacts,
      reconcileRecommendationFindings,
    ],
  );
  const factsParams = calls[2]?.params as { recommendationIds: string[] };
  assert.deepEqual(
    factsParams.recommendationIds,
    recommendations.map((recommendation) => recommendation.id.value),
  );
});

test("addMany with no recommendations is a no-op", async () => {
  const { database, calls } = trackedDatabase();

  await new PgRecommendationRepository(database).addMany(tenantId, []);

  assert.deepEqual(calls, []);
});

test("save checks the expected revision before reconciling children", async () => {
  const loaded = loadedRecommendation();
  const { database, calls } = trackedDatabase();

  const revision = await new PgRecommendationRepository(database).save(
    tenantId,
    loaded,
  );

  assert.equal(revision, "8");
  assert.equal(
    (calls[0]?.params as { expectedRevision: string }).expectedRevision,
    "7",
  );
  assert.deepEqual(
    calls.map((call) => call.statement),
    [
      updateRecommendation,
      reconcileRecommendationFacts,
      reconcileRecommendationFindings,
    ],
  );
});

test("save rejects a stale aggregate and does not touch children", async () => {
  const { database, calls } = trackedDatabase({ updateSucceeds: false });

  await assert.rejects(
    new PgRecommendationRepository(database).save(
      tenantId,
      loadedRecommendation(),
    ),
    ConcurrencyConflictException,
  );
  assert.deepEqual(
    calls.map((call) => call.statement),
    [updateRecommendation],
  );
});
