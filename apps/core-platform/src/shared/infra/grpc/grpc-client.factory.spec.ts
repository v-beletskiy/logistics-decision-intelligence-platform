import * as assert from "node:assert/strict";
import { test } from "node:test";

import * as grpc from "@grpc/grpc-js";

import {
  GrpcClientFactory,
  type GrpcClientConnection,
} from "./grpc-client.factory.js";

class TestGrpcClient {
  constructor(
    readonly target: string,
    readonly credentials: grpc.ChannelCredentials,
    readonly options?: grpc.ClientOptions,
  ) {}
}

test("creates a generated client with adapter-supplied connection details", () => {
  const connection: GrpcClientConnection = {
    target: "recommendation-platform:50051",
    credentials: grpc.credentials.createInsecure(),
    channelOptions: { "grpc.keepalive_time_ms": 10_000 },
  };

  const client = new GrpcClientFactory().createClient(
    TestGrpcClient,
    connection,
  );

  assert.equal(client.target, connection.target);
  assert.equal(client.credentials, connection.credentials);
  assert.equal(client.options, connection.channelOptions);
});
