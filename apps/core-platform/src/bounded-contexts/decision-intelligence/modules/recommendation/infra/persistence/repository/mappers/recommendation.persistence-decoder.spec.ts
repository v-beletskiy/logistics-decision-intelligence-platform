import assert from "node:assert/strict";
import test from "node:test";

import { SchemaValidationError } from "@logistics-decision-intelligence/validation/json-schema";

import { MeasurementUnit } from "../../../../../../domain/measurement-unit.enum";
import { RecommendationMetric } from "../../../../../../domain/recommendation-metric.enum";
import { FindingCategory } from "../../../../domain/recommendation.enums";
import {
  decodePersistedFacts,
  decodePersistedFindings,
} from "./recommendation.persistence-decoder";

test("decodes valid persisted recommendation details", () => {
  const facts = decodePersistedFacts([
    {
      id: "11111111-1111-4111-8111-111111111111",
      metric: RecommendationMetric.TotalDistance,
      baselineValue: 120,
      recommendedValue: 100,
      unit: MeasurementUnit.Kilometers,
      improvement: 16.67,
    },
  ]);
  const findings = decodePersistedFindings([
    {
      id: "22222222-2222-4222-8222-222222222222",
      category: FindingCategory.Strength,
      title: "Shorter route",
      description: "The proposed stop order reduces distance.",
    },
  ]);

  assert.equal(facts[0]?.metric, RecommendationMetric.TotalDistance);
  assert.equal(findings[0]?.title, "Shorter route");
});

test("rejects malformed persisted recommendation details", () => {
  assert.throws(
    () =>
      decodePersistedFindings([
        {
          id: "22222222-2222-4222-8222-222222222222",
          category: FindingCategory.Strength,
          title: 42,
          description: "The proposed stop order reduces distance.",
        },
      ]),
    SchemaValidationError,
  );
});
