import { Injectable } from "@nestjs/common";

import { ConcurrencyConflictException } from "../../../../../../../shared/app/app.exceptions";
import { PgDatabase } from "../../../../../../../shared/infra/persistence/pg-database";
import type { RouteReference } from "../../../../../domain/route-reference";
import { Optimization } from "../../../domain/optimization.aggregate";
import { OptimizationId } from "../../../domain/optimization-id";
import {
  OptimizationRepository,
  type LoadedOptimization,
} from "../../../domain/optimization.repository";
import { OptimizationMapper } from "./mappers/optimization.mapper";
import { acquireOptimizationRouteReplacementLock } from "./queries/optimization.acquire-route-replacement-lock.queries";
import { addOptimization } from "./queries/optimization.add.queries";
import { deleteOptimization } from "./queries/optimization.delete.queries";
import { findOptimizationById } from "./queries/optimization.find-by-id.queries";
import { findActiveOptimizationByRouteIdForUpdate } from "./queries/optimization.find-active-by-route-id-for-update.queries";
import { updateOptimization } from "./queries/optimization.update.queries";

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

  async findActiveByRouteIdForReplacement(
    tenantId: string,
    routeId: RouteReference,
  ): Promise<LoadedOptimization | null> {
    await this.database.exec(acquireOptimizationRouteReplacementLock, {
      tenantId,
      routeId: routeId.value,
    });
    const [row] = await this.database.exec(
      findActiveOptimizationByRouteIdForUpdate,
      {
        tenantId,
        routeId: routeId.value,
      },
    );
    return row
      ? {
          aggregate: OptimizationMapper.toDomain(row),
          expectedRevision: row.revision,
        }
      : null;
  }

  async add(tenantId: string, optimization: Optimization): Promise<void> {
    const [row] = await this.database.exec(
      addOptimization,
      OptimizationMapper.toPersistence(tenantId, optimization),
    );
    if (!row) {
      throw new ConcurrencyConflictException(
        "An active Optimization was created concurrently for this Route.",
      );
    }
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
