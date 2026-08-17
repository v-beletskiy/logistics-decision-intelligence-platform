import * as assert from "node:assert/strict";
import { test } from "node:test";

import { AppConfigurationError, createAppConfig } from "./app-config";

const validEnvironment: NodeJS.ProcessEnv = {
  DATABASE_URL: "postgres://postgres:postgres@localhost:5432/core_platform",
  RABBITMQ_URL: "amqp://logistics:logistics@localhost:5672",
  JWT_PRIVATE_KEY: "cHJpdmF0ZSBrZXk=",
  JWT_PUBLIC_KEY: "cHVibGljIGtleQ==",
};

test("uses declared configuration defaults and coerces numeric environment values", () => {
  const config = createAppConfig({
    ...validEnvironment,
    PORT: "3100",
    DATABASE_POOL_MAX: "20",
  });

  assert.deepEqual(config.processRoles, ["api"]);
  assert.equal(config.port, 3100);
  assert.equal(config.database.poolMax, 20);
  assert.equal(config.authentication.privateKeyPem, "private key");
});

test("normalizes process-role separators before AJV validates the role set", () => {
  const config = createAppConfig({
    ...validEnvironment,
    PROCESS_ROLES: "api, outbox-publisher",
  });

  assert.deepEqual(config.processRoles, ["api", "outbox-publisher"]);
});

test("rejects unsupported and duplicate process roles declaratively", () => {
  assert.throws(
    () => createAppConfig({ ...validEnvironment, PROCESS_ROLES: "api,scheduler" }),
    (error: unknown) =>
      error instanceof AppConfigurationError && /must be equal to one of/.test(error.message),
  );
  assert.throws(
    () => createAppConfig({ ...validEnvironment, PROCESS_ROLES: "api,api" }),
    (error: unknown) =>
      error instanceof AppConfigurationError && /must NOT have duplicate items/.test(error.message),
  );
});

test("requires JWT keys only for an API process", () => {
  assert.throws(
    () => createAppConfig({ ...validEnvironment, JWT_PRIVATE_KEY: undefined }),
    (error: unknown) =>
      error instanceof AppConfigurationError && /privateKeyBase64/.test(error.message),
  );

  const config = createAppConfig({
    DATABASE_URL: validEnvironment.DATABASE_URL,
    RABBITMQ_URL: validEnvironment.RABBITMQ_URL,
    PROCESS_ROLES: "outbox-publisher",
  });
  assert.equal(config.authentication.privateKeyPem, undefined);
  assert.equal(config.authentication.publicKeyPem, undefined);
});

test("rejects malformed numeric and base64 configuration values", () => {
  assert.throws(
    () => createAppConfig({ ...validEnvironment, PORT: "0" }),
    (error: unknown) =>
      error instanceof AppConfigurationError && /\/port must be >= 1/.test(error.message),
  );
  assert.throws(
    () => createAppConfig({ ...validEnvironment, JWT_PRIVATE_KEY: "not base64!" }),
    (error: unknown) =>
      error instanceof AppConfigurationError && /privateKeyBase64/.test(error.message),
  );
});

test("requires the configured schema namespace to be an owned HTTPS base URI", () => {
  assert.throws(
    () =>
      createAppConfig({
        ...validEnvironment,
        JSON_SCHEMA_BASE_URI: "http://schemas.example.com",
      }),
    (error: unknown) =>
      error instanceof AppConfigurationError && /must be an HTTPS URI/.test(error.message),
  );
});
