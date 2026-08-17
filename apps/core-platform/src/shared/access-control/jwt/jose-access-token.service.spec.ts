import * as assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { test } from "node:test";

import type { AppConfig } from "../../infra/config/app-config";
import { AuthenticationException } from "../authentication/authentication.exception";
import { IdentityType } from "../identity/identity-type.enum";
import { Role } from "../roles/role.enum";
import { JoseAccessTokenService } from "./jose-access-token.service";

const { privateKey, publicKey } = generateKeyPairSync("ec", {
  namedCurve: "prime256v1",
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" },
});

function config(audience = "core-platform"): AppConfig {
  return {
    processRoles: ["api"],
    host: "127.0.0.1",
    port: 3000,
    schemaBaseUri: "https://schemas.example.com",
    database: { url: "postgres://unused", poolMax: 1 },
    authentication: {
      issuer: "test-issuer",
      audience,
      accessTokenTtlSeconds: 900,
      privateKeyPem: privateKey,
      publicKeyPem: publicKey,
    },
    messaging: {
      rabbitMqUrl: "amqp://unused",
      reconnectDelayMs: 1,
      retryBaseDelayMs: 1,
      maxDeliveryAttempts: 1,
      maxIncomingMessageBytes: 1024,
      maxOutgoingMessageBytes: 1024,
      outboxPollIntervalMs: 1,
      outboxBatchSize: 1,
      outboxMaxBatchesPerDrain: 1,
      outboxProcessingLeaseMs: 1,
    },
  };
}

test("issues and verifies a strictly typed user access token", async () => {
  const tokens = new JoseAccessTokenService(config());
  const identity = {
    id: "00000000-0000-4000-8000-000000000001",
    tenantId: "00000000-0000-4000-8000-000000000010",
    roles: [Role.Planner],
    type: IdentityType.User as const,
  };

  const issued = await tokens.issue(identity);

  assert.equal(issued.tokenType, "Bearer");
  assert.equal(issued.expiresIn, 900);
  assert.deepEqual(await tokens.verify(issued.accessToken), identity);
});

test("rejects a token minted for another audience", async () => {
  const issued = await new JoseAccessTokenService(config("other-api")).issue({
    id: "00000000-0000-4000-8000-000000000001",
    tenantId: "00000000-0000-4000-8000-000000000010",
    roles: [Role.Planner],
    type: IdentityType.User,
  });

  await assert.rejects(
    new JoseAccessTokenService(config()).verify(issued.accessToken),
    AuthenticationException,
  );
});
