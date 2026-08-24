import { hydratePersistenceData } from "../../../../../../../../shared/infra/persistence/persistence-hydration.js";
import {
  RouteStop,
  RouteStopOperationType,
  RouteStopStatus,
  type RouteStopProps,
} from "../../../../domain/route-stop.aggregate.js";
import { RouteId } from "../../../../domain/route-id.js";
import { RouteStopId } from "../../../../domain/route-stop-id.js";
import { ShipmentId } from "../../../../../shipment/domain/shipment-id.js";

export interface RouteStopPersistenceRow {
  readonly id: string;
  readonly route_id: string;
  readonly shipment_id: string;
  readonly sequence: number;
  readonly operation_type: string;
  readonly status: string;
  readonly planned_arrival_at: Date;
  readonly planned_departure_at: Date;
  readonly actual_arrival_at: Date | null;
  readonly actual_departure_at: Date | null;
}

/** Maps a RouteStop persistence row to its independently persisted aggregate. */
export class RouteStopMapper {
  static toDomain(row: RouteStopPersistenceRow): RouteStop {
    return hydratePersistenceData("route stop", () => {
      const props: RouteStopProps = {
        routeId: RouteId.from(row.route_id),
        shipmentId: ShipmentId.from(row.shipment_id),
        sequence: row.sequence,
        operationType: row.operation_type as RouteStopOperationType,
        status: row.status as RouteStopStatus,
        plannedArrivalAt: row.planned_arrival_at,
        plannedDepartureAt: row.planned_departure_at,
        actualArrivalAt: row.actual_arrival_at ?? undefined,
        actualDepartureAt: row.actual_departure_at ?? undefined,
      };
      return RouteStop.reconstitute(RouteStopId.from(row.id), props);
    });
  }

  static toPersistence(tenantId: string, stop: RouteStop) {
    return {
      tenantId,
      id: stop.id.value,
      routeId: stop.routeId.value,
      shipmentId: stop.shipmentId.value,
      sequence: stop.sequence,
      operationType: stop.operationType,
      status: stop.status,
      plannedArrivalAt: stop.plannedArrivalAt,
      plannedDepartureAt: stop.plannedDepartureAt,
      actualArrivalAt: stop.actualArrivalAt,
      actualDepartureAt: stop.actualDepartureAt,
    };
  }
}
