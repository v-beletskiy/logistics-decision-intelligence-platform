import { Inject, Injectable } from "@nestjs/common";

import {
  APP_CONFIG,
  type AppConfig,
} from "../../../../shared/infra/config/app-config";
import { HttpClient } from "../../../../shared/infra/http/http-client";
import type { GeoCoordinateProps } from "../../../../shared/domain/shared-kernel/value-objects/location/geo-coordinate";
import type { CostMatrixProvider } from "../../../app/optimization/ports/cost-matrix-provider.port";
import type { CostMatrix } from "../../../domain-modules/optimization/domain/cost-matrix";

const FALLBACK_SPEED_METERS_PER_SECOND = 50 / 3.6;

interface OsrmTableResponse {
  readonly code: string;
  readonly distances?: readonly (readonly (number | null)[])[];
  readonly durations?: readonly (readonly (number | null)[])[];
}

interface CompleteOsrmTable {
  readonly code: string;
  readonly distances: readonly (readonly number[])[];
  readonly durations: readonly (readonly number[])[];
}

/** Road-network distance/duration matrix served by OSRM. */
@Injectable()
export class OsrmCostMatrixProvider implements CostMatrixProvider {
  constructor(
    private readonly httpClient: HttpClient,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  async compute(points: readonly GeoCoordinateProps[]): Promise<CostMatrix> {
    const coordinates = points
      .map((point) => `${point.longitude},${point.latitude}`)
      .join(";");
    const url =
      `${this.config.optimization.osrmUrl}/table/v1/driving/${coordinates}` +
      `?annotations=distance,duration&fallback_speed=${FALLBACK_SPEED_METERS_PER_SECOND}`;
    const table = await this.httpClient.get<OsrmTableResponse>(url);
    if (table.code !== "Ok") {
      throw new Error("OSRM failed to compute a cost matrix.");
    }
    assertComplete(table);
    return {
      labels: points.map((point) => `${point.latitude},${point.longitude}`),
      distanceMatrix: table.distances.map((row) =>
        row.map((meters) => meters / 1000),
      ),
      durationMatrix: table.durations,
    };
  }
}

function assertComplete(table: OsrmTableResponse): asserts table is CompleteOsrmTable {
  if (table.distances === undefined || table.durations === undefined) {
    throw new Error("OSRM failed to compute a cost matrix.");
  }
  const hasNullCell = (row: readonly (number | null)[]): boolean =>
    row.some((cell) => cell === null);
  if (
    table.distances.some(hasNullCell) ||
    table.durations.some(hasNullCell)
  ) {
    throw new Error(
      "OSRM could not compute a route between all requested stops.",
    );
  }
}