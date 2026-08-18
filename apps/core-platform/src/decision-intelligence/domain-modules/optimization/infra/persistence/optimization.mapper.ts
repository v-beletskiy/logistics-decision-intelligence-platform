import { RouteId } from "../../../../../operational-workspace/domain-modules/route/domain/route-id";
import { hydratePersistenceData } from "../../../../../shared/infra/persistence/persistence-hydration";
import {
  Optimization,
  OptimizationStatus,
} from "../../domain/optimization.aggregate";
import { OptimizationId } from "../../domain/optimization-id";
import type { IAddOptimizationParams } from "./repository/queries/optimization.add.queries";

export interface OptimizationPersistenceRow {
  readonly id: string;
  readonly route_id: string;
  readonly status: string;
  readonly input_version: number | null;
  readonly revision: string;
}

/** Maps between the Optimization aggregate and its PostgreSQL representation. */
export class OptimizationMapper {
  static toDomain(row: OptimizationPersistenceRow): Optimization {
    return hydratePersistenceData("optimization", () =>
      Optimization.reconstitute(OptimizationId.from(row.id), {
        routeId: RouteId.from(row.route_id),
        status: row.status as OptimizationStatus,
        inputVersion: row.input_version ?? undefined,
      }),
    );
  }

  static toPersistence(
    tenantId: string,
    optimization: Optimization,
  ): IAddOptimizationParams {
    return {
      tenantId,
      id: optimization.id.value,
      routeId: optimization.routeId.value,
      status: optimization.status,
      inputVersion: optimization.inputVersion ?? null,
    };
  }
}