import * as assert from "node:assert/strict";
import { test } from "node:test";

import type { HttpClient } from "../../../../../../shared/infra/http/http-client.js";
import { VroomClient } from "./vroom-client.js";
import type { VroomRequest } from "./vroom-request.js";

const request: VroomRequest = {
  jobs: [],
  shipments: [],
  vehicles: [
    {
      id: 1,
      profile: "car",
      start: [30.52, 50.45],
      start_index: 0,
      time_window: [0, 1],
    },
  ],
  matrices: { car: { durations: [[0]], distances: [[0]] } },
};

function httpClient(response: unknown): HttpClient {
  return {
    async get(): Promise<unknown> {
      throw new Error("not used");
    },
    async post(): Promise<unknown> {
      return response;
    },
  };
}

test("accepts a structurally valid VROOM response", async () => {
  const client = new VroomClient(
    httpClient({ code: 0, routes: [{ vehicle: 1, cost: 0, steps: [] }] }),
  );

  const response = await client.optimize("http://vroom:3000", request);
  assert.equal(response.route.vehicle, 1);
});

test("rejects a structurally valid but incomplete VROOM solution", async () => {
  const client = new VroomClient(
    httpClient({
      code: 0,
      routes: [{ vehicle: 1, cost: 0, steps: [] }],
      unassigned: [{ id: 1 }],
    }),
  );

  await assert.rejects(
    () => client.optimize("http://vroom:3000", request),
    /incomplete optimization solution/,
  );
});

test("rejects a VROOM solution that omits a requested job", async () => {
  const client = new VroomClient(
    httpClient({ code: 0, routes: [{ vehicle: 1, cost: 0, steps: [] }] }),
  );
  const requestWithJob: VroomRequest = {
    jobs: [{ id: 1, location: [30.52, 50.45], location_index: 0 }],
    shipments: [],
    vehicles: request.vehicles,
    matrices: request.matrices,
  };

  await assert.rejects(
    () => client.optimize("http://vroom:3000", requestWithJob),
    /incomplete optimization solution/,
  );
});

test("rejects malformed VROOM route data at the adapter boundary", async () => {
  const client = new VroomClient(
    httpClient({ code: 0, routes: [{ vehicle: "one", cost: 0 }] }),
  );

  await assert.rejects(
    () => client.optimize("http://vroom:3000", request),
    /malformed optimization response/,
  );
});
