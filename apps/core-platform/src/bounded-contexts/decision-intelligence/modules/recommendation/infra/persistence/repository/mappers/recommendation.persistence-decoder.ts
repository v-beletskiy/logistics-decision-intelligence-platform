import type { FromSchema } from "json-schema-to-ts";

import {
  JSON_SCHEMA_DRAFT_07,
  SchemaRegistry,
  type IdentifiedSchema,
} from "@logistics-decision-intelligence/validation/json-schema";

import { corePlatformSchemaId } from "../../../../../../../../shared/infra/validation/schema-id";
import { MeasurementUnit } from "../../../../../../domain/measurement-unit.enum";
import { RecommendationMetric } from "../../../../../../domain/recommendation-metric.enum";
import { FindingCategory } from "../../../../domain/recommendation.enums";

const recommendationMetrics = [
  RecommendationMetric.TotalDistance,
  RecommendationMetric.TotalDuration,
  RecommendationMetric.FuelConsumption,
  RecommendationMetric.EstimatedArrival,
  RecommendationMetric.EstimatedCost,
  RecommendationMetric.DriverUtilization,
  RecommendationMetric.VehicleUtilization,
] as const satisfies readonly RecommendationMetric[];

const measurementUnits = [
  MeasurementUnit.Kilometers,
  MeasurementUnit.Seconds,
  MeasurementUnit.Liters,
  MeasurementUnit.Kilograms,
  MeasurementUnit.CubicMeters,
  MeasurementUnit.Currency,
  MeasurementUnit.Percentage,
  MeasurementUnit.Count,
  MeasurementUnit.Score,
] as const satisfies readonly MeasurementUnit[];

const findingCategories = [
  FindingCategory.Strength,
  FindingCategory.Risk,
  FindingCategory.Assumption,
] as const satisfies readonly FindingCategory[];

const persistedFactSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "metric",
    "baselineValue",
    "recommendedValue",
    "unit",
    "improvement",
  ],
  properties: {
    id: { type: "string", format: "uuid" },
    metric: { type: "string", enum: recommendationMetrics },
    baselineValue: { type: "number" },
    recommendedValue: { type: "number" },
    unit: { type: "string", enum: measurementUnits },
    improvement: { type: "number" },
  },
} as const;

const persistedFindingSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "category", "title", "description"],
  properties: {
    id: { type: "string", format: "uuid" },
    category: { type: "string", enum: findingCategories },
    title: { type: "string", minLength: 1 },
    description: { type: "string", minLength: 1 },
  },
} as const;

const persistedFactsSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId(
    "persistence",
    "recommendations",
    "recommendation-facts",
    "v1",
  ),
  type: "array",
  items: persistedFactSchema,
} as const satisfies IdentifiedSchema;

const persistedFindingsSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId(
    "persistence",
    "recommendations",
    "recommendation-findings",
    "v1",
  ),
  type: "array",
  items: persistedFindingSchema,
} as const satisfies IdentifiedSchema;

export type PersistedFact = FromSchema<typeof persistedFactsSchema>[number];
export type PersistedFinding = FromSchema<
  typeof persistedFindingsSchema
>[number];

const recommendationPersistenceSchemas = new SchemaRegistry([
  persistedFactsSchema,
  persistedFindingsSchema,
]);

export function decodePersistedFacts(value: unknown): readonly PersistedFact[] {
  return recommendationPersistenceSchemas.assert<readonly PersistedFact[]>(
    persistedFactsSchema.$id,
    value,
  );
}

export function decodePersistedFindings(
  value: unknown,
): readonly PersistedFinding[] {
  return recommendationPersistenceSchemas.assert<readonly PersistedFinding[]>(
    persistedFindingsSchema.$id,
    value,
  );
}
