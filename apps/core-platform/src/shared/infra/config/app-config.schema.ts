import {
  base64EncodedTextSchemaRef,
  JSON_SCHEMA_DRAFT_07,
  positiveSafeIntegerSchemaRef,
  type IdentifiedSchema,
} from "@logistics-decision-intelligence/validation/json-schema";

import { API_PROCESS_ROLE, PROCESS_ROLES } from "./app-config.types";

export const APP_CONFIG_SCHEMA_ID =
  "https://schemas.logistics-decision-intelligence.com/core-platform/configuration/app-config/v1";

/**
 * Process configuration is an infrastructure boundary. Its identifier is fixed
 * because JSON_SCHEMA_BASE_URI is one of the values validated by this schema.
 */
export const appConfigSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: APP_CONFIG_SCHEMA_ID,
  type: "object",
  additionalProperties: false,
  required: [
    "processRoles",
    "host",
    "port",
    "schemaBaseUri",
    "database",
    "authentication",
    "messaging",
  ],
  properties: {
    processRoles: {
      type: "array",
      minItems: 1,
      uniqueItems: true,
      items: { enum: PROCESS_ROLES },
    },
    host: { type: "string", minLength: 1 },
    port: positiveSafeIntegerSchemaRef,
    schemaBaseUri: { type: "string", format: "uri", minLength: 1 },
    database: {
      type: "object",
      additionalProperties: false,
      required: ["url", "poolMax"],
      properties: {
        url: { type: "string", format: "uri", minLength: 1 },
        poolMax: positiveSafeIntegerSchemaRef,
      },
    },
    authentication: {
      type: "object",
      additionalProperties: false,
      required: ["issuer", "audience", "accessTokenTtlSeconds"],
      properties: {
        issuer: { type: "string", minLength: 1 },
        audience: { type: "string", minLength: 1 },
        accessTokenTtlSeconds: positiveSafeIntegerSchemaRef,
        privateKeyBase64: base64EncodedTextSchemaRef,
        publicKeyBase64: base64EncodedTextSchemaRef,
      },
    },
    messaging: {
      type: "object",
      additionalProperties: false,
      required: [
        "rabbitMqUrl",
        "reconnectDelayMs",
        "retryBaseDelayMs",
        "maxDeliveryAttempts",
        "maxIncomingMessageBytes",
        "maxOutgoingMessageBytes",
        "outboxPollIntervalMs",
        "outboxBatchSize",
        "outboxMaxBatchesPerDrain",
        "outboxProcessingLeaseMs",
      ],
      properties: {
        rabbitMqUrl: { type: "string", format: "uri", minLength: 1 },
        reconnectDelayMs: positiveSafeIntegerSchemaRef,
        retryBaseDelayMs: positiveSafeIntegerSchemaRef,
        maxDeliveryAttempts: positiveSafeIntegerSchemaRef,
        maxIncomingMessageBytes: positiveSafeIntegerSchemaRef,
        maxOutgoingMessageBytes: positiveSafeIntegerSchemaRef,
        outboxPollIntervalMs: positiveSafeIntegerSchemaRef,
        outboxBatchSize: positiveSafeIntegerSchemaRef,
        outboxMaxBatchesPerDrain: positiveSafeIntegerSchemaRef,
        outboxProcessingLeaseMs: positiveSafeIntegerSchemaRef,
      },
    },
  },
  allOf: [
    {
      if: {
        properties: {
          processRoles: {
            contains: { const: API_PROCESS_ROLE },
          },
        },
      },
      then: {
        type: "object",
        properties: {
          authentication: {
            type: "object",
            properties: {
              privateKeyBase64: base64EncodedTextSchemaRef,
              publicKeyBase64: base64EncodedTextSchemaRef,
            },
            required: ["privateKeyBase64", "publicKeyBase64"],
          },
        },
      },
    },
  ],
} as const satisfies IdentifiedSchema;
