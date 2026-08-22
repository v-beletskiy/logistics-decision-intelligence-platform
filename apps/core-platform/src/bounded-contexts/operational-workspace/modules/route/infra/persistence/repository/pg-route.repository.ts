import { Injectable } from "@nestjs/common";

import { ConcurrencyConflictException } from "../../../../../../../shared/app/app.exceptions";
import { PgDatabase } from "../../../../../../../shared/infra/persistence/pg-database";
import { Route } from "../../../domain/route.aggregate";
import { RouteId } from "../../../domain/route-id";
import {
  RouteRepository,
  type LoadedRoute,
} from "../../../domain/route.repository";
import { RouteMapper } from "./mappers/route.mapper";
import { findRouteByIdForUpdate } from "./queries/route.find-by-id-for-update.queries";
import { findRouteById } from "./queries/route.find-by-id.queries";
import { insertRoute } from "./queries/route.insert.queries";
import { updateRoute } from "./queries/route.update.queries";

@Injectable()
export class PgRouteRepository extends RouteRepository {
  constructor(private readonly database: PgDatabase) {
    super();
  }

  async findById(tenantId: string, id: RouteId): Promise<LoadedRoute | null> {
    const [row] = await this.database.exec(findRouteById, {
      tenantId,
      id: id.value,
    });
    return row
      ? { aggregate: RouteMapper.toDomain(row), expectedRevision: row.revision }
      : null;
  }

  async findByIdForUpdate(
    tenantId: string,
    id: RouteId,
  ): Promise<LoadedRoute | null> {
    const [row] = await this.database.exec(findRouteByIdForUpdate, {
      tenantId,
      id: id.value,
    });
    return row
      ? { aggregate: RouteMapper.toDomain(row), expectedRevision: row.revision }
      : null;
  }

  async add(tenantId: string, route: Route): Promise<void> {
    await this.database.exec(
      insertRoute,
      RouteMapper.toPersistence(tenantId, route),
    );
  }

  async save(tenantId: string, loadedRoute: LoadedRoute): Promise<string> {
    const [row] = await this.database.exec(updateRoute, {
      ...RouteMapper.toPersistence(tenantId, loadedRoute.aggregate),
      expectedRevision: loadedRoute.expectedRevision,
    });
    if (!row) {
      throw new ConcurrencyConflictException(
        "Route was changed or removed by another operation.",
      );
    }
    return row.revision;
  }
}
