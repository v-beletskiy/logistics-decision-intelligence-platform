import { Injectable } from "@nestjs/common";

import {
  persistChildChanges,
  persistRoot,
} from "../../../../../shared/infra/persistence/orm/pg-persist-changes";
import { PgDatabase } from "../../../../../shared/infra/persistence/pg-database";
import { Route } from "../../domain/route.aggregate";
import { RouteId } from "../../domain/route-id";
import { RouteRepository } from "../../domain/route.repository";
import type { ShipmentId } from "../../../shipment/domain/shipment-id";
import { deleteRoute } from "./queries/route.delete.queries";
import { deleteRouteStops } from "./queries/route.delete-stops.queries";
import { findRouteById } from "./queries/route.find-by-id.queries";
import { findRoutesByShipmentId } from "./queries/route.find-by-shipment-id.queries";
import { insertRoute } from "./queries/route.insert.queries";
import { insertRouteStops } from "./queries/route.insert-stops.queries";
import { updateRoute } from "./queries/route.update.queries";
import { updateRouteStops } from "./queries/route.update-stops.queries";
import { RouteMapper } from "./route.mapper";
import type { RouteEntity } from "./entities/route.entity";

@Injectable()
export class PgRouteRepository extends RouteRepository {
  constructor(private readonly database: PgDatabase) {
    super();
  }

  async findById(id: RouteId): Promise<Route | null> {
    const [route] = await this.database.exec(findRouteById, { id: id.value });
    if (!route) return null;
    return RouteMapper.toDomain(route as unknown as RouteEntity);
  }

  async findByShipmentId(shipmentId: ShipmentId): Promise<readonly Route[]> {
    const routes = await this.database.exec(findRoutesByShipmentId, {
      shipmentId: shipmentId.value,
    });
    return routes.map((route) =>
      RouteMapper.toDomain(route as unknown as RouteEntity),
    );
  }

  async save(route: Route): Promise<void> {
    const persistence = RouteMapper.toPersistence(route);

    await persistRoot(this.database, persistence.isNew, {
      insertStatement: insertRoute,
      updateStatement: updateRoute,
      params: persistence.root,
    });

    await persistChildChanges(this.database, {
      inserts: persistence.inserts,
      updates: persistence.updates,
      removedIds: persistence.removedIds,
      insertStatement: insertRouteStops,
      updateStatement: updateRouteStops,
      deleteStatement: deleteRouteStops,
    });
  }

  async delete(id: RouteId): Promise<void> {
    await this.database.exec(deleteRoute, { id: id.value });
  }
}
