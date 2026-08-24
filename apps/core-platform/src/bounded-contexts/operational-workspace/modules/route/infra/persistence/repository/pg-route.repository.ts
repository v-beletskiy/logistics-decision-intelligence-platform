import { Injectable } from "@nestjs/common";

import { PgDatabase } from "../../../../../../../shared/infra/persistence/pg-database.js";
import { execRevisionedPgUpdate } from "../../../../../../../shared/infra/persistence/pg-repository-write.js";
import { Route } from "../../../domain/route.aggregate.js";
import { RouteId } from "../../../domain/route-id.js";
import {
  RouteRepository,
  type LoadedRoute,
} from "../../../domain/route.repository.js";
import { RouteMapper } from "./mappers/route.mapper.js";
import { findRouteByIdForUpdate } from "./queries/route.find-by-id-for-update.queries.js";
import { findRouteById } from "./queries/route.find-by-id.queries.js";
import { insertRoute } from "./queries/route.insert.queries.js";
import { updateRoute } from "./queries/route.update.queries.js";

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
    return execRevisionedPgUpdate({
      database: this.database,
      statement: updateRoute,
      params: {
        ...RouteMapper.toPersistence(tenantId, loadedRoute.aggregate),
        expectedRevision: loadedRoute.expectedRevision,
      },
      options: { aggregateName: "Route" },
    });
  }
}
