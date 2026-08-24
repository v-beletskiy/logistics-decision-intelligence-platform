import * as assert from "node:assert/strict";
import { test } from "node:test";

import { AppConfigurationError, createAppConfig } from "./app-config.js";

const validEnvironment: NodeJS.ProcessEnv = {
  PROCESS_ROLE: "api",
  DATABASE_URL: "postgres://postgres:postgres@localhost:5432/core_platform",
  RABBITMQ_URL: "amqp://logistics:logistics@localhost:5672",
  VROOM_URL: "http://vroom:3000",
  OSRM_URL: "http://osrm:5000",
  JWT_PRIVATE_KEY: "cHJpdmF0ZSBrZXk=",
  JWT_PUBLIC_KEY: "cHVibGljIGtleQ==",
};

test("applies declared configuration defaults and coerces numeric environment values", () => {
  const config = createAppConfig({
    ...validEnvironment,
    PORT: "3100",
    DATABASE_POOL_MAX: "20",
  });

  assert.equal(config.processRole, "api");
  if (config.processRole !== "api") assert.fail("Expected API configuration.");
  assert.equal(config.http.port, 3100);
  assert.equal(config.database.maxConnections, 20);
  assert.equal(config.authentication.privateKeyPem, "private key");
});

test("accepts one explicit process role", () => {
  const config = createAppConfig({
    ...validEnvironment,
    PROCESS_ROLE: "worker",
  });

  assert.equal(config.processRole, "worker");
  if (config.processRole !== "worker")
    assert.fail("Expected worker configuration.");
  assert.equal(config.optimization.vroomBaseUrl, "http://vroom:3000");
});

test("requires one supported process role before full validation", () => {
  assert.throws(
    () => createAppConfig({ ...validEnvironment, PROCESS_ROLE: "scheduler" }),
    (error: unknown) =>
      error instanceof AppConfigurationError &&
      /PROCESS_ROLE/.test(error.message),
  );
  assert.throws(
    () => createAppConfig({ ...validEnvironment, PROCESS_ROLE: undefined }),
    (error: unknown) =>
      error instanceof AppConfigurationError &&
      /must be configured/.test(error.message),
  );
  assert.throws(
    () =>
      createAppConfig({
        ...validEnvironment,
        PROCESS_ROLE: "api,worker",
      }),
    (error: unknown) =>
      error instanceof AppConfigurationError &&
      /must be one of/.test(error.message),
  );
});

test("requires JWT keys only for an API process", () => {
  assert.throws(
    () => createAppConfig({ ...validEnvironment, JWT_PRIVATE_KEY: undefined }),
    (error: unknown) =>
      error instanceof AppConfigurationError &&
      /privateKeyBase64/.test(error.message),
  );

  const config = createAppConfig({
    DATABASE_URL: validEnvironment.DATABASE_URL,
    RABBITMQ_URL: validEnvironment.RABBITMQ_URL,
    VROOM_URL: validEnvironment.VROOM_URL,
    OSRM_URL: validEnvironment.OSRM_URL,
    PROCESS_ROLE: "worker",
  });
  assert.equal("authentication" in config, false);
});

test("maps URL parser constraint failures to configuration errors", () => {
  assert.throws(
    () =>
      createAppConfig({
        DATABASE_URL: validEnvironment.DATABASE_URL,
        RABBITMQ_URL: validEnvironment.RABBITMQ_URL,
        VROOM_URL: "ftp://vroom:3000",
        OSRM_URL: validEnvironment.OSRM_URL,
        PROCESS_ROLE: "worker",
      }),
    (error: unknown) =>
      error instanceof AppConfigurationError &&
      /VROOM_URL must use http: or https:/.test(error.message),
  );
});

test("rejects malformed numeric and base64 configuration values", () => {
  assert.throws(
    () => createAppConfig({ ...validEnvironment, PORT: "0" }),
    (error: unknown) =>
      error instanceof AppConfigurationError &&
      /\/port must be >= 1/.test(error.message),
  );
  assert.throws(
    () =>
      createAppConfig({ ...validEnvironment, JWT_PRIVATE_KEY: "not base64!" }),
    (error: unknown) =>
      error instanceof AppConfigurationError &&
      /privateKeyBase64/.test(error.message),
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
      error instanceof AppConfigurationError &&
      /must be an HTTPS URI/.test(error.message),
  );
});
