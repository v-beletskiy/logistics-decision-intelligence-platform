import { Route, RouteStatus } from "../../domain/route.aggregate";
import {
  RouteStop,
  RouteStopOperationType,
  RouteStopStatus,
  type RouteStopProps,
} from "../../domain/route-stop.entity";
import { RouteId } from "../../domain/route-id";
import { RouteStopId } from "../../domain/route-stop-id";
import { AggregatePersistenceMapper } from "../../../../../shared/infra/persistence/orm/aggregate-mapper";
import type { RouteEntity } from "./entities/route.entity";
import type { RouteStopEntity } from "./entities/route-stop.entity";
import type { IInsertRouteParams } from "./queries/route.insert.queries";
import type { IInsertRouteStopsParams } from "./queries/route.insert-stops.queries";
import type { IUpdateRouteStopsParams } from "./queries/route.update-stops.queries";

/** Root row consumed by persistRoot, matching the route insert/update statements. */
export type RouteRootRow = IInsertRouteParams;

/** Row consumed by the bulk route-stop insert statement. */
export type RouteStopInsertRow = IInsertRouteStopsParams["rows"][number];

/** Row consumed by the bulk route-stop update statement. */
export type RouteStopUpdateRow = IUpdateRouteStopsParams["rows"][number];

/** Write rows derived from the aggregate's persistence plan. */
export interface RouteWriteModel {
  readonly isNew: boolean;
  readonly root: RouteRootRow;
  readonly inserts: readonly RouteStopInsertRow[];
  readonly updates: readonly RouteStopUpdateRow[];
  readonly removedIds: readonly string[];
}

/**
 * Explicit persistence-to-domain and domain-to-persistence mapping for Route.
 *
 * Reads trust the persisted shape; business rules are validated by the domain
 * constructors. Writes derive their rows from the aggregate's persistence plan,
 * with each stop's execution sequence taken from its current position.
 */
export class RouteMapper extends AggregatePersistenceMapper {
  static toDomain(row: RouteEntity): Route {
    const stops = this.requireJsonArray<RouteStopEntity>(
      row.stops,
      "route stops",
    ).map((stop): RouteStop => {
      const props: RouteStopProps = {
        shipmentId: stop.shipmentId,
        operationType: stop.operationType as RouteStopOperationType,
        status: stop.status as RouteStopStatus,
        schedule: {
          arrivalTime: new Date(stop.arrivalTime),
          departureTime: new Date(stop.departureTime),
        },
      };
      return RouteStop.reconstitute(RouteStopId.from(stop.id), props);
    });

    return Route.reconstitute(RouteId.from(row.id), {
      status: row.status as RouteStatus,
      stops,
    });
  }

  static toPersistence(route: Route): RouteWriteModel {
    const plan = route.getPersistencePlan();
    const sequence = new Map(
      route.stops.map((stop, index) => [stop.id, index + 1]),
    );
    return {
      isNew: plan.isNew,
      root: {
        id: route.id.value,
        status: route.status,
      },
      inserts: plan.stops.inserts.map((stop) => ({
        id: stop.id.value,
        routeId: route.id.value,
        shipmentId: stop.shipmentId,
        operationType: stop.operationType,
        status: stop.status,
        executionSequence: sequence.get(stop.id.value)!,
        arrivalTime: stop.schedule.arrivalTime,
        departureTime: stop.schedule.departureTime,
      })),
      updates: plan.stops.updates.map((stop) => ({
        id: stop.id.value,
        shipmentId: stop.shipmentId,
        operationType: stop.operationType,
        status: stop.status,
        executionSequence: String(sequence.get(stop.id.value)!),
        arrivalTime: stop.schedule.arrivalTime.toISOString(),
        departureTime: stop.schedule.departureTime.toISOString(),
      })),
      removedIds: [...plan.stops.removedIds],
    };
  }
}
