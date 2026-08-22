import {
  base64EncodedTextSchemaRef,
  JSON_SCHEMA_DRAFT_07,
  type IdentifiedSchema,
} from "@logistics-decision-intelligence/validation/json-schema";

import {
  API_PROCESS_ROLE,
  SUPPORTED_PROCESS_ROLES,
  WORKER_PROCESS_ROLE,
} from "./app-config.types";

export const APP_CONFIG_SCHEMA_ID =
  "https://schemas.logistics-decision-intelligence.com/core-platform/configuration/app-config/v1";

const port = { type: "integer", minimum: 1, maximum: 65_535 } as const;
const positiveInteger = { type: "integer", minimum: 1 } as const;

export const appConfigSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: APP_CONFIG_SCHEMA_ID,
  type: "object",
  additionalProperties: false,
  required: ["processRole", "schemaBaseUri", "database", "messaging"],
  properties: {
    processRole: { enum: SUPPORTED_PROCESS_ROLES },
    schemaBaseUri: { type: "string", format: "uri", minLength: 1 },
    http: {
      type: "object",
      additionalProperties: false,
      required: ["host", "port"],
      properties: {
        host: { type: "string", minLength: 1 },
        port,
      },
    },
    database: {
      type: "object",
      additionalProperties: false,
      required: ["url", "maxConnections"],
      properties: {
        url: { type: "string", format: "uri", minLength: 1 },
        maxConnections: { ...positiveInteger, maximum: 1_000 },
      },
    },
    grpc: {
      type: "object",
      additionalProperties: false,
      required: ["host", "port"],
      properties: {
        host: { type: "string", minLength: 1 },
        port,
      },
    },
    authentication: {
      type: "object",
      additionalProperties: false,
      required: [
        "issuer",
        "audience",
        "accessTokenTtlSeconds",
        "privateKeyBase64",
        "publicKeyBase64",
      ],
      properties: {
        issuer: { type: "string", minLength: 1, maxLength: 512 },
        audience: { type: "string", minLength: 1, maxLength: 512 },
        accessTokenTtlSeconds: { ...positiveInteger, maximum: 86_400 },
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
        reconnectDelayMs: { ...positiveInteger, maximum: 300_000 },
        retryBaseDelayMs: { ...positiveInteger, maximum: 300_000 },
        maxDeliveryAttempts: { ...positiveInteger, maximum: 100 },
        maxIncomingMessageBytes: { ...positiveInteger, maximum: 100_000_000 },
        maxOutgoingMessageBytes: { ...positiveInteger, maximum: 100_000_000 },
        outboxPollIntervalMs: { ...positiveInteger, maximum: 300_000 },
        outboxBatchSize: { ...positiveInteger, maximum: 10_000 },
        outboxMaxBatchesPerDrain: { ...positiveInteger, maximum: 10_000 },
        outboxProcessingLeaseMs: { ...positiveInteger, maximum: 3_600_000 },
      },
    },
    optimization: {
      type: "object",
      additionalProperties: false,
      required: ["vroomBaseUrl", "osrmBaseUrl", "workerPrefetch"],
      properties: {
        vroomBaseUrl: { type: "string", format: "uri", minLength: 1 },
        osrmBaseUrl: { type: "string", format: "uri", minLength: 1 },
        workerPrefetch: { ...positiveInteger, maximum: 1_000 },
      },
    },
  },
  allOf: [
    {
      if: { properties: { processRole: { const: API_PROCESS_ROLE } } },
      then: {
        properties: { http: {}, grpc: {}, authentication: {} },
        required: ["http", "grpc", "authentication"],
      },
    },
    {
      if: { properties: { processRole: { const: WORKER_PROCESS_ROLE } } },
      then: {
        properties: { optimization: {} },
        required: ["optimization"],
      },
    },
  ],
} as const satisfies IdentifiedSchema;
