import assert from "node:assert/strict";
import test from "node:test";

import { RecommendationReadMapper } from "./recommendation-read.mapper.js";

test("maps recommendation projection rows to read models", () => {
  const [recommendation] = RecommendationReadMapper.toListItems([
    {
      id: "11111111-1111-4111-8111-111111111111",
      optimization_id: "22222222-2222-4222-8222-222222222222",
      type: "OPTIMIZE_ROUTE_PLAN",
      status: "PENDING",
      score: 12,
      analysis_status: "COMPLETED",
      summary: "The proposed order reduces distance.",
      confidence: 92,
      proposed_route_stop_ids: [
        "33333333-3333-4333-8333-333333333333",
        "44444444-4444-4444-8444-444444444444",
      ],
      facts: [
        {
          metric: "TOTAL_DISTANCE",
          baselineValue: 100,
          recommendedValue: 88,
          unit: "KILOMETERS",
          improvement: -12,
        },
      ],
      findings: [
        {
          category: "STRENGTH",
          title: "Shorter route",
          description: "The proposed order saves distance.",
        },
      ],
    },
  ]);

  assert.equal(recommendation?.analysisStatus, "COMPLETED");
  assert.equal(recommendation?.analysis?.confidence, 92);
  assert.equal(recommendation?.facts[0]?.improvement, -12);
  assert.deepEqual(recommendation?.proposedRouteStopIds, [
    "33333333-3333-4333-8333-333333333333",
    "44444444-4444-4444-8444-444444444444",
  ]);
});
