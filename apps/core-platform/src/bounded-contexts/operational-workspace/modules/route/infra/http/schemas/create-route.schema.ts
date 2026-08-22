import {
  type IdentifiedSchema,
  JSON_SCHEMA_DRAFT_07,
} from "@logistics-decision-intelligence/validation/json-schema";

import { corePlatformSchemaId } from "../../../../../../../shared/infra/validation/schema-id";

export const createRouteRequestSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId("http", "routes", "create-request", "v1"),
  type: "object",
  additionalProperties: false,
  required: ["stops"],
  properties: {
    stops: {
      type: "array",
      minItems: 2,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "shipmentId",
          "operationType",
          "plannedArrivalAt",
          "plannedDepartureAt",
        ],
        properties: {
          shipmentId: { type: "string", format: "uuid" },
          operationType: { type: "string", enum: ["PICKUP", "DELIVERY"] },
          plannedArrivalAt: { type: "string", format: "date-time" },
          plannedDepartureAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
} as const satisfies IdentifiedSchema;
