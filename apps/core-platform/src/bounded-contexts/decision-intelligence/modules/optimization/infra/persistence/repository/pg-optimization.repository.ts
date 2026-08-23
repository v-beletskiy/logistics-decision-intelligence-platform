import { Injectable } from "@nestjs/common";

import { ConcurrencyConflictException } from "../../../../../../../shared/app/app.exceptions";
import { PgDatabase } from "../../../../../../../shared/infra/persistence/pg-database";
import { PG_SQLSTATE } from "../../../../../../../shared/infra/persistence/pg-error";
import {
  execAndTranslatePgConstraintViolations,
  execRevisionedPgUpdate,
  type PgConstraintViolationTranslation,
} from "../../../../../../../shared/infra/persistence/pg-repository-write";
import type { RouteReference } from "../../../../../domain/route-reference";
import { Optimization } from "../../../domain/optimization.aggregate";
import { OptimizationId } from "../../../domain/optimization-id";
import {
  OptimizationRepository,
  type LoadedOptimization,
} from "../../../domain/optimization.repository";
import { OptimizationMapper } from "./mappers/optimization.mapper";
import { acquireOptimizationRouteLock } from "./queries/optimization.acquire-route-lock.queries";
import { addOptimization } from "./queries/optimization.add.queries";
import { deleteOptimization } from "./queries/optimization.delete.queries";
import { findOptimizationById } from "./queries/optimization.find-by-id.queries";
import { findActiveOptimizationByRouteIdForUpdate } from "./queries/optimization.find-active-by-route-id-for-update.queries";
import { updateOptimization } from "./queries/optimization.update.queries";

const ACTIVE_OPTIMIZATION_ROUTE_UNIQUE_CONSTRAINT =
  "optimizations_tenant_active_route_uniq";
const OPTIMIZATION_WRITE_CONSTRAINT_TRANSLATIONS = [
  {
    sqlState: PG_SQLSTATE.UNIQUE_VIOLATION,
    constraint: ACTIVE_OPTIMIZATION_ROUTE_UNIQUE_CONSTRAINT,
    toError: () =>
      new ConcurrencyConflictException(
        "An active Optimization was created concurrently for this Route.",
      ),
  },
] satisfies readonly PgConstraintViolationTranslation[];

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

  async findActiveByRouteIdForUpdate(
    tenantId: string,
    routeId: RouteReference,
  ): Promise<LoadedOptimization | null> {
    await this.database.exec(acquireOptimizationRouteLock, {
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
    await execAndTranslatePgConstraintViolations({
      database: this.database,
      statement: addOptimization,
      params: OptimizationMapper.toPersistence(tenantId, optimization),
      options: { translations: OPTIMIZATION_WRITE_CONSTRAINT_TRANSLATIONS },
    });
  }

  async save(
    tenantId: string,
    loadedOptimization: LoadedOptimization,
  ): Promise<string> {
    return execRevisionedPgUpdate({
      database: this.database,
      statement: updateOptimization,
      params: {
        ...OptimizationMapper.toPersistence(
          tenantId,
          loadedOptimization.aggregate,
        ),
        expectedRevision: loadedOptimization.expectedRevision,
      },
      options: { aggregateName: "Optimization" },
    });
  }

  async delete(tenantId: string, id: OptimizationId): Promise<void> {
    await this.database.exec(deleteOptimization, { tenantId, id: id.value });
  }
}
