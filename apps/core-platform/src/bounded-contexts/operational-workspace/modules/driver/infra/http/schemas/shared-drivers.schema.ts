import {
  type Draft07Schema,
  type IdentifiedSchema,
  JSON_SCHEMA_DRAFT_07,
} from "@logistics-decision-intelligence/validation/json-schema";

import { corePlatformSchemaId } from "../../../../../../../shared/infra/validation/schema-id.js";

export const driverRouteParamsSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId("http", "drivers", "driver-route-params", "v1"),
  type: "object",
  additionalProperties: false,
  required: ["driverId"],
  properties: { driverId: { type: "string", format: "uuid" } },
} as const satisfies IdentifiedSchema;

export const driverCertificationRouteParamsSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId(
    "http",
    "drivers",
    "driver-certification-route-params",
    "v1",
  ),
  type: "object",
  additionalProperties: false,
  required: ["driverId", "certificationId"],
  properties: {
    driverId: { type: "string", format: "uuid" },
    certificationId: { type: "string", format: "uuid" },
  },
} as const satisfies IdentifiedSchema;

export const driverCertificationRequestSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId(
    "http",
    "drivers",
    "driver-certification-request",
    "v1",
  ),
  type: "object",
  additionalProperties: false,
  required: ["type", "credentialNumber", "validFrom", "validUntil"],
  properties: {
    type: { type: "string", minLength: 1, maxLength: 100 },
    credentialNumber: { type: "string", minLength: 1, maxLength: 100 },
    validFrom: { type: "string", format: "date-time" },
    validUntil: { type: "string", format: "date-time" },
  },
} as const satisfies IdentifiedSchema;

export const driverDetailsRequestFields = {
  firstName: { type: "string", minLength: 1, maxLength: 100 },
  lastName: { type: "string", minLength: 1, maxLength: 100 },
  licenseNumber: { type: "string", minLength: 1, maxLength: 100 },
  depotId: { type: "string", format: "uuid" },
  phoneNumber: { type: "string", minLength: 1, maxLength: 32 },
} as const satisfies NonNullable<Draft07Schema["properties"]>;

export const driverDetailsRequestRequiredFields = [
  "firstName",
  "lastName",
  "licenseNumber",
] as const satisfies readonly string[];
