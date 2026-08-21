import * as assert from "node:assert/strict";
import { test } from "node:test";

import type { AppConfig } from "../../../../shared/infra/config/app-config";
import type { HttpClient } from "../../../../shared/infra/http/http-client";
import { OsrmCostMatrixProvider } from "./osrm-cost-matrix.provider";

function config(osrmUrl = "http://osrm:5000"): AppConfig {
  return {
    optimization: { osrmUrl, vroomUrl: "http://vroom:3000", workerPrefetch: 2 },
  } as unknown as AppConfig;
}

function httpClient(overrides: {
  code?: string;
  distances?: readonly (readonly (number | null)[])[];
  durations?: readonly (readonly (number | null)[])[];
} = {}): { client: HttpClient; requestedUrl: () => string } {
  let requestedUrl = "";
  const client: HttpClient = {
    async get<T>(url: string): Promise<T> {
      requestedUrl = url;
      return {
        code: overrides.code ?? "Ok",
        distances: overrides.distances,
        durations: overrides.durations,
      } as T;
    },
    async post<T>(): Promise<T> {
      throw new Error("not used");
    },
  };
  return { client, requestedUrl: () => requestedUrl };
}

const points = [
  { latitude: 50.45, longitude: 30.52 },
  { latitude: 49.84, longitude: 24.03 },
];

test("computes a road-network cost matrix via the OSRM table endpoint", async () => {
  const { client, requestedUrl } = httpClient({
    distances: [
      [0, 1000],
      [2500, 0],
    ],
    durations: [
      [0, 60],
      [120, 0],
    ],
  });

  const provider = new OsrmCostMatrixProvider(client, config());
  const matrix = await provider.compute(points);

  assert.match(
    requestedUrl(),
    /^http:\/\/osrm:5000\/table\/v1\/driving\/30\.52,50\.45;24\.03,49\.84\?annotations=distance,duration&fallback_speed=\d/,
  );
  assert.deepEqual(matrix.labels, ["50.45,30.52", "49.84,24.03"]);
  assert.deepEqual(matrix.distanceMatrix, [
    [0, 1],
    [2.5, 0],
  ]);
  assert.deepEqual(matrix.durationMatrix, [
    [0, 60],
    [120, 0],
  ]);
});

test("throws when OSRM returns an incomplete matrix", async () => {
  const { client } = httpClient({
    distances: [
      [0, null],
      [2500, 0],
    ],
    durations: [
      [0, 60],
      [120, 0],
    ],
  });

  const provider = new OsrmCostMatrixProvider(client, config());
  await assert.rejects(() => provider.compute(points), /could not compute a route/);
});