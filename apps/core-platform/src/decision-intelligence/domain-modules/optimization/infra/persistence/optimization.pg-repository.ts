import { Injectable } from "@nestjs/common";

import { ConcurrencyConflictException } from "../../../../../shared/app/app.exceptions";
import { PgDatabase } from "../../../../../shared/infra/persistence/pg-database";
import { RouteId } from "../../../../../operational-workspace/domain-modules/route/domain/route-id";
import { Optimization } from "../../domain/optimization.aggregate";
import { OptimizationId } from "../../domain/optimization-id";
import {
  OptimizationRepository,
  type LoadedOptimization,
} from "../../domain/optimization.repository";
import { OptimizationMapper } from "./optimization.mapper";
import { addOptimization } from "./repository/queries/optimization.add.queries";
import { deleteOptimization } from "./repository/queries/optimization.delete.queries";
import { findOptimizationById } from "./repository/queries/optimization.find-by-id.queries";
import { findOptimizationByRouteIdActive } from "./repository/queries/optimization.find-by-route-id-active.queries";
import { updateOptimization } from "./repository/queries/optimization.update.queries";

@Injectable()
export class PgOptimizationRepository extends OptimizationRepository {
  constructor(private readonly database: PgDatabase) {
    super();
  }

  async findById(
    tenantId: string,
    id: OptimizationId,
  ): Promise<LoadedOptimization | null> {
    const [row] = await this.database.exec(findOptimizationById, {
      tenantId,
      id: id.value,
    });
    return row
      ? {
          aggregate: OptimizationMapper.toDomain(row),
          expectedRevision: row.revision,
        }
      : null;
  }

  async findActiveByRouteId(
    tenantId: string,
    routeId: RouteId,
  ): Promise<LoadedOptimization | null> {
    const [row] = await this.database.exec(findOptimizationByRouteIdActive, {
      tenantId,
      routeId: routeId.value,
    });
    return row
      ? {
          aggregate: OptimizationMapper.toDomain(row),
          expectedRevision: row.revision,
        }
      : null;
  }

  async add(tenantId: string, optimization: Optimization): Promise<boolean> {
    const [row] = await this.database.exec(
      addOptimization,
      OptimizationMapper.toPersistence(tenantId, optimization),
    );
    return row !== undefined;
  }

  async save(
    tenantId: string,
    loadedOptimization: LoadedOptimization,
  ): Promise<string> {
    const [row] = await this.database.exec(updateOptimization, {
      ...OptimizationMapper.toPersistence(
        tenantId,
        loadedOptimization.aggregate,
      ),
      expectedRevision: loadedOptimization.expectedRevision,
    });
    if (!row) {
      throw new ConcurrencyConflictException(
        "Optimization was changed or removed by another operation.",
      );
    }
    return row.revision;
  }

  async delete(tenantId: string, id: OptimizationId): Promise<void> {
    await this.database.exec(deleteOptimization, { tenantId, id: id.value });
  }
}
