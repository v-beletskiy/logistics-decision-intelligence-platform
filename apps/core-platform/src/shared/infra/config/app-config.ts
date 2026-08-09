import { env } from "node:process";

export const APP_CONFIG = Symbol("APP_CONFIG");

const PROCESS_ROLES = ["api", "outbox-publisher"] as const;
export type ProcessRole = (typeof PROCESS_ROLES)[number];

export interface AppConfig {
  readonly processRoles: readonly ProcessRole[];
  readonly host: string;
  readonly port: number;
  readonly database: {
    readonly url: string;
    readonly poolMax: number;
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

function readPositiveInt(name: string, fallback: number): number {
  const value = env[name];
  if (value === undefined) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return parsed;
}

function readNonEmptyStr(name: string): string {
  const value = env[name];
  if (value === undefined) {
    throw new Error(`${name} must be defined.`);
  }
  return value;
}

export function parseProcessRoles(
  value: string | undefined,
): readonly ProcessRole[] {
  if (value === undefined) {
    return ["api"];
  }

  const roles = value.split(",").map((role) => role.trim());
  const processRoles: ProcessRole[] = [];
  const uniqueRoles = new Set<string>();
  for (const role of roles) {
    if (!isProcessRole(role)) {
      throw new Error(
        `PROCESS_ROLES contains unsupported role ${JSON.stringify(role)}. Supported roles: ${PROCESS_ROLES.join(", ")}.`,
      );
    }
    if (uniqueRoles.has(role)) {
      throw new Error(
        `PROCESS_ROLES contains duplicate role ${JSON.stringify(role)}.`,
      );
    }
    uniqueRoles.add(role);
    processRoles.push(role);
  }

  return processRoles;
}

function isProcessRole(value: string): value is ProcessRole {
  return (PROCESS_ROLES as readonly string[]).includes(value);
}

export function createAppConfig(): AppConfig {
  return {
    processRoles: parseProcessRoles(env.PROCESS_ROLES),
    host: env.HOST ?? "0.0.0.0",
    port: readPositiveInt("PORT", 3000),
    database: {
      url: readNonEmptyStr("DATABASE_URL"),
      poolMax: readPositiveInt("DATABASE_POOL_MAX", 10),
    },
    messaging: {
      rabbitMqUrl: readNonEmptyStr("RABBITMQ_URL"),
      reconnectDelayMs: readPositiveInt("RABBITMQ_RECONNECT_DELAY_MS", 1_000),
      retryBaseDelayMs: readPositiveInt("RABBITMQ_RETRY_BASE_DELAY_MS", 1_000),
      maxDeliveryAttempts: readPositiveInt("RABBITMQ_MAX_DELIVERY_ATTEMPTS", 5),
      maxIncomingMessageBytes: readPositiveInt(
        "RABBITMQ_MAX_INCOMING_MESSAGE_BYTES",
        1 * 1024 * 1024, // 1MB
      ),
      maxOutgoingMessageBytes: readPositiveInt(
        "RABBITMQ_MAX_OUTGOING_MESSAGE_BYTES",
        1 * 1024 * 1024, // 1MB
      ),
      outboxPollIntervalMs: readPositiveInt("OUTBOX_POLL_INTERVAL_MS", 5_000),
      outboxBatchSize: readPositiveInt("OUTBOX_BATCH_SIZE", 50),
      outboxMaxBatchesPerDrain: readPositiveInt(
        "OUTBOX_MAX_BATCHES_PER_DRAIN",
        10,
      ),
      outboxProcessingLeaseMs: readPositiveInt(
        "OUTBOX_PROCESSING_LEASE_MS",
        300_000,
      ),
    },
  };
}
