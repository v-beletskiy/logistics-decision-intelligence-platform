import * as assert from "node:assert/strict";
import { test } from "node:test";

import type { RouteOptimizationInputStop } from "./optimization.inputs";
import type { CostMatrix } from "./cost-matrix";
import { OptimizationCostModel } from "./optimization-cost-model";
import { RouteOptimizationEvaluator } from "./route-optimization-evaluator";

const stops: readonly RouteOptimizationInputStop[] = [
  { shipmentId: "s1", location: { latitude: 50.45, longitude: 30.52 }, plannedArrivalAt: new Date("2026-08-10T08:00:00Z"), plannedDepartureAt: new Date("2026-08-10T08:30:00Z") },
  { shipmentId: "s2", location: { latitude: 49.84, longitude: 24.03 }, plannedArrivalAt: new Date("2026-08-10T09:00:00Z"), plannedDepartureAt: new Date("2026-08-10T09:30:00Z") },
  { shipmentId: "s3", location: { latitude: 48.0, longitude: 22.0 }, plannedArrivalAt: new Date("2026-08-10T10:00:00Z"), plannedDepartureAt: new Date("2026-08-10T10:30:00Z") },
];

const matrix: CostMatrix = {
  labels: ["a", "b", "c"],
  distanceMatrix: [
    [0, 10, 5],
    [5, 0, 10],
    [10, 5, 0],
  ],
  durationMatrix: [
    [0, 600, 300],
    [300, 0, 600],
    [600, 300, 0],
  ],
};

const costModel = OptimizationCostModel.create();

test("evaluates an optimized route against its baseline", () => {
  const evaluator = new RouteOptimizationEvaluator(costModel);
  const evaluation = evaluator.evaluate({
    stops,
    matrix,
    orderedStopIndexes: [0, 2, 1],
  });

  assert.equal(evaluation.score, 50);
  assert.deepEqual(evaluation.baseline, {
    distanceKm: 20,
    durationSeconds: 1200,
  });
  assert.deepEqual(evaluation.recommended, {
    distanceKm: 10,
    durationSeconds: 600,
  });
  assert.equal(evaluation.distanceImprovementPercent, -50);
  assert.equal(evaluation.durationImprovementPercent, -50);
});