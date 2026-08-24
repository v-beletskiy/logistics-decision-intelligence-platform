import * as assert from "node:assert/strict";
import { test } from "node:test";

import { RecommendationFact } from "../../../domain/recommendation-fact.entity.js";
import { MeasurementUnit } from "../../../domain/measurement-unit.enum.js";
import { RecommendationMetric } from "../../../domain/recommendation-metric.enum.js";
import { Finding } from "./finding.entity.js";
import { FindingCategory } from "./recommendation.enums.js";

test("RecommendationFact create assigns a stable identity", () => {
  const fact = RecommendationFact.create({
    metric: RecommendationMetric.TotalDistance,
    baselineValue: 1200,
    recommendedValue: 1050,
    unit: MeasurementUnit.Kilometers,
    improvement: -12.5,
  });

  const restored = RecommendationFact.reconstitute(fact.id, {
    metric: fact.metric,
    baselineValue: fact.baselineValue,
    recommendedValue: fact.recommendedValue,
    unit: fact.unit,
    improvement: fact.improvement,
  });

  assert.ok(fact.id.value.length > 0);
  assert.equal(fact.equals(restored), true);
  assert.equal(
    fact.equals(
      RecommendationFact.create({
        metric: RecommendationMetric.TotalDistance,
        baselineValue: 1200,
        recommendedValue: 1050,
        unit: MeasurementUnit.Kilometers,
        improvement: -12.5,
      }),
    ),
    false,
  );
});

test("Finding create assigns a stable identity", () => {
  const finding = Finding.create({
    category: FindingCategory.Risk,
    title: "Border delay",
    description: "Customs may extend transit time.",
  });

  const restored = Finding.reconstitute(finding.id, {
    category: finding.category,
    title: finding.title,
    description: finding.description,
  });

  assert.ok(finding.id.value.length > 0);
  assert.equal(finding.equals(restored), true);
  assert.equal(
    finding.equals(
      Finding.create({
        category: FindingCategory.Risk,
        title: "Border delay",
        description: "Customs may extend transit time.",
      }),
    ),
    false,
  );
});
