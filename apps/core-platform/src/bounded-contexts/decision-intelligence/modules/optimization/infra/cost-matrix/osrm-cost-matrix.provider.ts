import { Inject, Injectable } from "@nestjs/common";
import {
  SchemaRegistry,
  SchemaValidationError,
} from "@logistics-decision-intelligence/validation/json-schema";

import {
  APP_CONFIG,
  type WorkerAppConfig,
} from "../../../../../../shared/infra/config/app-config.js";
import { HttpClient } from "../../../../../../shared/infra/http/http-client.js";
import type { GeoCoordinateProps } from "../../../../../../shared/domain/value-objects/location/geo-coordinate.js";
import type { CostMatrixProvider } from "../../app/ports/cost-matrix-provider.js";
import type { CostMatrix } from "../../domain/cost-matrix.js";
import {
  osrmTableResponseSchema,
  type OsrmTableResponse,
} from "./osrm-table-response.schema.js";

const FALLBACK_SPEED_METERS_PER_SECOND = 50 / 3.6;

interface CompleteOsrmTable {
  readonly code: string;
  readonly distances: readonly (readonly number[])[];
  readonly durations: readonly (readonly number[])[];
}

const osrmResponseSchemas = new SchemaRegistry([osrmTableResponseSchema]);

/** Road-network distance/duration matrix served by OSRM. */
@Injectable()
export class OsrmCostMatrixProvider implements CostMatrixProvider {
  constructor(
    private readonly httpClient: HttpClient,
    @Inject(APP_CONFIG) private readonly config: WorkerAppConfig,
  ) {}

  async compute(points: readonly GeoCoordinateProps[]): Promise<CostMatrix> {
    const coordinates = points
      .map((point) => `${point.longitude},${point.latitude}`)
      .join(";");
    const url =
      `${this.config.optimization.osrmBaseUrl}/table/v1/driving/${coordinates}` +
      `?annotations=distance,duration&fallback_speed=${FALLBACK_SPEED_METERS_PER_SECOND}`;
    const table = decodeOsrmTableResponse(
      await this.httpClient.get(url),
      points.length,
    );
    return {
      labels: points.map((point) => `${point.latitude},${point.longitude}`),
      distanceMatrix: table.distances.map((row) =>
        row.map((meters) => meters / 1000),
      ),
      durationMatrix: table.durations,
    };
  }
}

function decodeOsrmTableResponse(
  value: unknown,
  expectedSize: number,
): CompleteOsrmTable {
  const table = parseOsrmTableResponse(value);
  if (table.code !== "Ok") {
    throw new Error("OSRM failed to compute a cost matrix.");
  }
  const { distances, durations } = table;
  if (distances === undefined || durations === undefined) {
    throw new Error("OSRM failed to compute a cost matrix.");
  }
  if (
    !isFiniteSquareMatrix(distances, expectedSize) ||
    !isFiniteSquareMatrix(durations, expectedSize)
  ) {
    throw new Error(
      "OSRM could not compute a route between all requested stops.",
    );
  }
  return { code: table.code, distances, durations };
}

function parseOsrmTableResponse(value: unknown): OsrmTableResponse {
  try {
    return osrmResponseSchemas.assert<OsrmTableResponse>(
      osrmTableResponseSchema.$id,
      value,
    );
  } catch (error: unknown) {
    if (error instanceof SchemaValidationError) {
      throw new Error("OSRM returned a malformed cost-matrix response.", {
        cause: error,
      });
    }
    throw error;
  }
}

function isFiniteSquareMatrix(
  value: unknown,
  expectedSize: number,
): value is readonly (readonly number[])[] {
  return (
    Array.isArray(value) &&
    value.length === expectedSize &&
    value.every(
      (row) =>
        Array.isArray(row) &&
        row.length === expectedSize &&
        row.every(
          (cell) =>
            typeof cell === "number" && Number.isFinite(cell) && cell >= 0,
        ),
    )
  );
}
