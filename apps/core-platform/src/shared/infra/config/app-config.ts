import { env } from "node:process";
import type { FromSchema } from "json-schema-to-ts";

import {
  createSchemaId,
  jsonSchemaPrimitives,
  SchemaRegistry,
  SchemaValidationError,
} from "@logistics-decision-intelligence/validation/json-schema";

import { DEFAULT_SCHEMA_BASE_URI } from "../validation/schema-id";
import { APP_CONFIG_SCHEMA_ID, appConfigSchema } from "./app-config.schema";
import { API_PROCESS_ROLE, type ProcessRole } from "./app-config.types";

export const APP_CONFIG = Symbol("APP_CONFIG");
export type { ProcessRole } from "./app-config.types";

export interface AppConfig {
  readonly processRoles: readonly ProcessRole[];
  readonly host: string;
  readonly port: number;
  readonly schemaBaseUri: string;
  readonly database: {
    readonly url: string;
    readonly poolMax: number;
  };
  readonly authentication: {
    readonly issuer: string;
    readonly audience: string;
    readonly accessTokenTtlSeconds: number;
    readonly privateKeyPem?: string;
    readonly publicKeyPem?: string;
  };
  readonly messaging: {
    readonly rabbitMqUrl: string;
    readonly reconnectDelayMs: number;
    readonly retryBaseDelayMs: number;
    readonly maxDeliveryAttempts: number;
    readonly maxIncomingMessageBytes: number;
    readonly maxOutgoingMessageBytes: number;
    readonly outboxPollIntervalMs: number;
    readonly outboxBatchSize: number;
    readonly outboxMaxBatchesPerDrain: number;
    readonly outboxProcessingLeaseMs: number;
  };
}

type ValidatedAppConfig = FromSchema<
  typeof appConfigSchema,
  { references: [typeof jsonSchemaPrimitives] }
>;

const appConfigRegistry = new SchemaRegistry(
  [jsonSchemaPrimitives, appConfigSchema],
  {
    coerceTypes: true,
  },
);

export class AppConfigurationError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AppConfigurationError";
  }
}

export function createAppConfig(
  environment: NodeJS.ProcessEnv = env,
): AppConfig {
  const config = validate(rawAppConfig(environment));
  return {
    processRoles: config.processRoles,
    host: config.host,
    port: config.port,
    schemaBaseUri: validateSchemaBaseUri(config.schemaBaseUri),
    database: {
      url: config.database.url,
      poolMax: config.database.poolMax,
    },
    authentication: {
      issuer: config.authentication.issuer,
      audience: config.authentication.audience,
      accessTokenTtlSeconds: config.authentication.accessTokenTtlSeconds,
      privateKeyPem: decodeBase64EncodedText(
        config.authentication.privateKeyBase64,
        "JWT_PRIVATE_KEY",
      ),
      publicKeyPem: decodeBase64EncodedText(
        config.authentication.publicKeyBase64,
        "JWT_PUBLIC_KEY",
      ),
    },
    messaging: {
      rabbitMqUrl: config.messaging.rabbitMqUrl,
      reconnectDelayMs: config.messaging.reconnectDelayMs,
      retryBaseDelayMs: config.messaging.retryBaseDelayMs,
      maxDeliveryAttempts: config.messaging.maxDeliveryAttempts,
      maxIncomingMessageBytes: config.messaging.maxIncomingMessageBytes,
      maxOutgoingMessageBytes: config.messaging.maxOutgoingMessageBytes,
      outboxPollIntervalMs: config.messaging.outboxPollIntervalMs,
      outboxBatchSize: config.messaging.outboxBatchSize,
      outboxMaxBatchesPerDrain: config.messaging.outboxMaxBatchesPerDrain,
      outboxProcessingLeaseMs: config.messaging.outboxProcessingLeaseMs,
    },
  };
}

function rawAppConfig(environment: NodeJS.ProcessEnv): object {
  return {
    processRoles: (environment.PROCESS_ROLES ?? API_PROCESS_ROLE)
      .split(",")
      .map((role) => role.trim()),
    host: environment.HOST ?? "0.0.0.0",
    port: environment.PORT ?? 3000,
    schemaBaseUri: environment.JSON_SCHEMA_BASE_URI ?? DEFAULT_SCHEMA_BASE_URI,
    database: {
      url: environment.DATABASE_URL,
      poolMax: environment.DATABASE_POOL_MAX ?? 10,
    },
    authentication: {
      issuer: environment.JWT_ISSUER ?? "logistics-decision-intelligence",
      audience: environment.JWT_AUDIENCE ?? "core-platform",
      accessTokenTtlSeconds: environment.JWT_ACCESS_TOKEN_TTL_SECONDS ?? 900,
      ...(environment.JWT_PRIVATE_KEY === undefined
        ? {}
        : { privateKeyBase64: environment.JWT_PRIVATE_KEY }),
      ...(environment.JWT_PUBLIC_KEY === undefined
        ? {}
        : { publicKeyBase64: environment.JWT_PUBLIC_KEY }),
    },
    messaging: {
      rabbitMqUrl: environment.RABBITMQ_URL,
      reconnectDelayMs: environment.RABBITMQ_RECONNECT_DELAY_MS ?? 1_000,
      retryBaseDelayMs: environment.RABBITMQ_RETRY_BASE_DELAY_MS ?? 1_000,
      maxDeliveryAttempts: environment.RABBITMQ_MAX_DELIVERY_ATTEMPTS ?? 5,
      maxIncomingMessageBytes:
        environment.RABBITMQ_MAX_INCOMING_MESSAGE_BYTES ?? 1_024 * 1_024,
      maxOutgoingMessageBytes:
        environment.RABBITMQ_MAX_OUTGOING_MESSAGE_BYTES ?? 1_024 * 1_024,
      outboxPollIntervalMs: environment.OUTBOX_POLL_INTERVAL_MS ?? 5_000,
      outboxBatchSize: environment.OUTBOX_BATCH_SIZE ?? 50,
      outboxMaxBatchesPerDrain: environment.OUTBOX_MAX_BATCHES_PER_DRAIN ?? 10,
      outboxProcessingLeaseMs:
        environment.OUTBOX_PROCESSING_LEASE_MS ?? 300_000,
    },
  };
}

function validate(value: object): ValidatedAppConfig {
  try {
    return appConfigRegistry.assert<ValidatedAppConfig>(
      APP_CONFIG_SCHEMA_ID,
      value,
    );
  } catch (error: unknown) {
    if (error instanceof SchemaValidationError) {
      throw new AppConfigurationError(
        `Application configuration is invalid: ${formatIssues(error)}.`,
        { cause: error },
      );
    }
    throw error;
  }
}

function formatIssues(error: SchemaValidationError): string {
  return error.issues
    .map((issue) => `${issue.pointer || "/"} ${issue.message}`)
    .join("; ");
}

function validateSchemaBaseUri(value: string): string {
  try {
    createSchemaId(value, "core-platform", "configuration");
  } catch (error: unknown) {
    throw new AppConfigurationError(
      "JSON_SCHEMA_BASE_URI must be an HTTPS URI without credentials, query, or fragment.",
      { cause: error },
    );
  }
  return value;
}

function decodeBase64EncodedText(
  value: string | undefined,
  variableName: string,
): string | undefined {
  if (value === undefined) return undefined;
  const decoded = Buffer.from(value, "base64").toString("utf8");
  if (decoded.trim().length === 0) {
    throw new AppConfigurationError(
      `${variableName} must contain base64-encoded non-blank text.`,
    );
  }
  return decoded;
}
