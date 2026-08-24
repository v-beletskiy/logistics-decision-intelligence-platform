import type { FromSchema } from "json-schema-to-ts";

import {
  JSON_SCHEMA_DRAFT_07,
  type IdentifiedSchema,
} from "@logistics-decision-intelligence/validation/json-schema";

import { corePlatformSchemaId } from "../../../../../../shared/infra/validation/schema-id.js";

const nonNegativeNumber = { type: "number", minimum: 0 } as const;
const nonNegativeInteger = { type: "integer", minimum: 0 } as const;

const vroomStepSchema = {
  type: "object",
  additionalProperties: true,
  required: ["type"],
  properties: {
    type: {
      enum: [
        "start",
        "job",
        "end",
        "break",
        "wait",
        "pickup",
        "delivery",
      ],
    },
    job: nonNegativeInteger,
    location: {
      type: "array",
      minItems: 2,
      maxItems: 2,
      items: [{ type: "number" }, { type: "number" }],
      additionalItems: false,
    },
    distance: nonNegativeNumber,
    duration: nonNegativeNumber,
    service: nonNegativeNumber,
    arrival: nonNegativeNumber,
    departure: nonNegativeNumber,
  },
} as const;

export const vroomSolutionSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId(
    "external",
    "vroom",
    "optimization-solution",
    "v1",
  ),
  type: "object",
  additionalProperties: true,
  required: ["code"],
  properties: {
    code: { type: "integer" },
    unassigned: { type: "array", items: {} },
    routes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: true,
        required: ["vehicle", "cost"],
        properties: {
          vehicle: nonNegativeInteger,
          cost: nonNegativeNumber,
          distance: nonNegativeNumber,
          duration: nonNegativeNumber,
          steps: { type: "array", items: vroomStepSchema },
        },
      },
    },
  },
} as const satisfies IdentifiedSchema;

export type VroomSolution = FromSchema<typeof vroomSolutionSchema>;
export type VroomRoute = NonNullable<VroomSolution["routes"]>[number];

/** Structurally and semantically validated result for the submitted problem. */
export interface SuccessfulVroomSolution {
  readonly route: VroomRoute;
  readonly orderedJobIds: readonly number[];
}
