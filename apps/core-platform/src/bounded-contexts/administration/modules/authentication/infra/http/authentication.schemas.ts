import {
  type IdentifiedSchema,
  JSON_SCHEMA_DRAFT_07,
  SchemaRegistry,
} from "@logistics-decision-intelligence/validation/json-schema";
import { JsonSchemaPipe } from "../../../../../../shared/infra/http/json-schema.pipe.js";
import { corePlatformSchemaId } from "../../../../../../shared/infra/validation/schema-id.js";

export const loginRequestSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId("http", "authentication", "login-request", "v1"),
  type: "object",
  additionalProperties: false,
  required: ["email", "password"],
  properties: {
    email: { type: "string", format: "email", maxLength: 254 },
    password: { type: "string", minLength: 1, maxLength: 128 },
  },
} as const satisfies IdentifiedSchema;

const authenticationSchemas = new SchemaRegistry([loginRequestSchema]);

export const loginRequestPipe = new JsonSchemaPipe(
  authenticationSchemas,
  loginRequestSchema,
);
