import { env } from "node:process";
import type { FromSchema } from "json-schema-to-ts";

import {
  parseUrl,
  type ParseUrlOptions,
  type UrlParseFailureReason,
} from "@logistics-decision-intelligence/validation";
import {
  createSchemaId,
  jsonSchemaPrimitives,
  SchemaRegistry,
  SchemaValidationError,
} from "@logistics-decision-intelligence/validation/json-schema";

import { DEFAULT_SCHEMA_BASE_URI } from "../validation/schema-id.js";
import { APP_CONFIG_SCHEMA_ID, appConfigSchema } from "./app-config.schema.js";
import {
  API_PROCESS_ROLE,
  SUPPORTED_PROCESS_ROLES,
  type ProcessRole,
  WORKER_PROCESS_ROLE,
} from "./app-config.types.js";

export const APP_CONFIG = Symbol("APP_CONFIG");
export type { ProcessRole } from "./app-config.types.js";

export interface DatabaseConfig {
  readonly url: string;
  readonly maxConnections: number;
}

export interface MessagingConfig {
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
}

interface BaseAppConfig {
  readonly processRole: ProcessRole;
  readonly schemaBaseUri: string;
  readonly database: DatabaseConfig;
  readonly messaging: MessagingConfig;
}

export interface ApiAppConfig extends BaseAppConfig {
  readonly processRole: typeof API_PROCESS_ROLE;
  readonly http: { readonly host: string; readonly port: number };
  readonly grpc: { readonly host: string; readonly port: number };
  readonly authentication: {
    readonly issuer: string;
    readonly audience: string;
    readonly accessTokenTtlSeconds: number;
    readonly privateKeyPem: string;
    readonly publicKeyPem: string;
  };
}

export interface WorkerAppConfig extends BaseAppConfig {
  readonly processRole: typeof WORKER_PROCESS_ROLE;
  readonly optimization: {
    readonly vroomBaseUrl: string;
    readonly osrmBaseUrl: string;
    readonly workerPrefetch: number;
  };
}

export type AppConfig = ApiAppConfig | WorkerAppConfig;

type ValidatedAppConfig = FromSchema<
  typeof appConfigSchema,
  { references: [typeof jsonSchemaPrimitives] }
>;

const appConfigRegistry = new SchemaRegistry(
  [jsonSchemaPrimitives, appConfigSchema],
  { coerceTypes: true },
);

export class AppConfigurationError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AppConfigurationError";
  }
}

export function readProcessRole(
  environment: NodeJS.ProcessEnv = env,
): ProcessRole {
  const value = environment.PROCESS_ROLE;
  if (value === undefined) {
    throw new AppConfigurationError("PROCESS_ROLE must be configured.");
  }
  if (!SUPPORTED_PROCESS_ROLES.includes(value as ProcessRole)) {
    throw new AppConfigurationError(
      `PROCESS_ROLE must be one of: ${SUPPORTED_PROCESS_ROLES.join(", ")}.`,
    );
  }
  return value as ProcessRole;
}

export function createAppConfig(
  environment: NodeJS.ProcessEnv = env,
): AppConfig {
  const processRole = readProcessRole(environment);
  const config = validate(rawAppConfig(environment, processRole));
  const base = {
    processRole,
    schemaBaseUri: validateSchemaBaseUri(config.schemaBaseUri),
    database: {
      url: requireConfigUrl(config.database.url, "DATABASE_URL", [
        "postgres:",
        "postgresql:",
      ]),
      maxConnections: config.database.maxConnections,
    },
    messaging: {
      ...config.messaging,
      rabbitMqUrl: requireConfigUrl(config.messaging.rabbitMqUrl, "RABBITMQ_URL", [
        "amqp:",
        "amqps:",
      ]),
    },
  };

  if (processRole === API_PROCESS_ROLE) {
    assertApiConfigSections(config);
    return {
      ...base,
      processRole,
      http: config.http,
      grpc: config.grpc,
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
    };
  }

  if (!config.optimization) {
    throw new AppConfigurationError(
      "Worker optimization configuration is missing.",
    );
  }
  return {
    ...base,
    processRole,
    optimization: {
      vroomBaseUrl: requireConfigBaseUrl(
        config.optimization.vroomBaseUrl,
        "VROOM_URL",
      ),
      osrmBaseUrl: requireConfigBaseUrl(
        config.optimization.osrmBaseUrl,
        "OSRM_URL",
      ),
      workerPrefetch: config.optimization.workerPrefetch,
    },
  };
}

function rawAppConfig(
  environment: NodeJS.ProcessEnv,
  processRole: ProcessRole,
): object {
  return {
    processRole,
    schemaBaseUri: environment.JSON_SCHEMA_BASE_URI ?? DEFAULT_SCHEMA_BASE_URI,
    database: {
      url: environment.DATABASE_URL,
      maxConnections:
        environment.DATABASE_MAX_CONNECTIONS ??
        environment.DATABASE_POOL_MAX ??
        10,
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
    ...(processRole === API_PROCESS_ROLE
      ? {
          http: {
            host: environment.HOST ?? "0.0.0.0",
            port: environment.PORT ?? 3_000,
          },
          grpc: {
            host: environment.GRPC_HOST ?? "0.0.0.0",
            port: environment.GRPC_PORT ?? 50_051,
          },
          authentication: {
            issuer: environment.JWT_ISSUER ?? "logistics-decision-intelligence",
            audience: environment.JWT_AUDIENCE ?? "core-platform",
            accessTokenTtlSeconds:
              environment.JWT_ACCESS_TOKEN_TTL_SECONDS ?? 900,
            privateKeyBase64: environment.JWT_PRIVATE_KEY,
            publicKeyBase64: environment.JWT_PUBLIC_KEY,
          },
        }
      : {
          optimization: {
            vroomBaseUrl: environment.VROOM_URL,
            osrmBaseUrl: environment.OSRM_URL,
            workerPrefetch: environment.OPTIMIZATION_WORKER_PREFETCH ?? 2,
          },
        }),
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
        `Application configuration is invalid: ${error.issues
          .map((issue) => `${issue.pointer || "/"} ${issue.message}`)
          .join("; ")}.`,
        { cause: error },
      );
    }
    throw error;
  }
}

function assertApiConfigSections(
  config: ValidatedAppConfig,
): asserts config is ValidatedAppConfig & {
  readonly http: NonNullable<ValidatedAppConfig["http"]>;
  readonly grpc: NonNullable<ValidatedAppConfig["grpc"]>;
  readonly authentication: NonNullable<ValidatedAppConfig["authentication"]>;
} {
  if (!config.http || !config.grpc || !config.authentication) {
    throw new AppConfigurationError("API configuration sections are missing.");
  }
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

function requireConfigBaseUrl(value: string, variableName: string): string {
  const url = parseConfigUrl(value, variableName, {
    allowedProtocols: ["http:", "https:"],
    forbidCredentials: true,
    forbidQuery: true,
    forbidFragment: true,
  });
  return url.toString().replace(/\/$/, "");
}

function requireConfigUrl(
  value: string,
  variableName: string,
  allowedProtocols: readonly string[],
): string {
  parseConfigUrl(value, variableName, { allowedProtocols });
  return value;
}

function parseConfigUrl(
  value: string,
  variableName: string,
  options: ParseUrlOptions,
): URL {
  const result = parseUrl(value, options);
  if (result.ok) return result.value;

  throw new AppConfigurationError(
    configUrlFailureMessage(variableName, options, result.reason),
  );
}

function configUrlFailureMessage(
  variableName: string,
  options: ParseUrlOptions,
  reason: UrlParseFailureReason,
): string {
  if (reason === "invalid") return `${variableName} must be a valid URL.`;
  if (reason === "protocol-not-allowed") {
    return `${variableName} must use ${options.allowedProtocols?.join(" or ") ?? "an allowed protocol"}.`;
  }
  if (reason === "credentials-not-allowed") {
    return `${variableName} must not contain credentials.`;
  }
  if (reason === "query-not-allowed") {
    return `${variableName} must not contain a query.`;
  }
  return `${variableName} must not contain a fragment.`;
}

function decodeBase64EncodedText(value: string, variableName: string): string {
  const decoded = Buffer.from(value, "base64").toString("utf8");
  if (decoded.trim().length === 0) {
    throw new AppConfigurationError(
      `${variableName} must contain base64-encoded non-blank text.`,
    );
  }
  return decoded;
}
