import type {
  RouteAnalysisContextResult,
  RouteAnalysisStopResult,
} from "../../../../app/queries/get-route-analysis-context/get-route-analysis-context.result.js";
import { RouteStopOperationType } from "../../../../domain/route-stop.aggregate.js";
import { hydratePersistenceData } from "../../../../../../../../shared/infra/persistence/persistence-hydration.js";
import type { IFindRouteAnalysisContextByRouteIdResult } from "../queries/route-analysis-context.find-by-route-id.queries.js";

/** Maps the Route analysis PostgreSQL projection to its Application result. */
export class RouteAnalysisContextMapper {
  static toResult(
    rows: readonly IFindRouteAnalysisContextByRouteIdResult[],
  ): RouteAnalysisContextResult | null {
    const [route] = rows;
    if (!route) return null;

    return hydratePersistenceData("Route analysis context", () => ({
      routeId: route.route_id,
      routeVersion: Number(route.route_revision),
      stops: rows.flatMap(RouteAnalysisContextMapper.toStop),
    }));
  }

  private static toStop(
    row: IFindRouteAnalysisContextByRouteIdResult,
  ): readonly RouteAnalysisStopResult[] {
    // A left join returns the Route row with an empty stop projection.
    if (row.shipment_id === null) return [];
    if (
      row.planned_arrival_at === null ||
      row.planned_departure_at === null ||
      row.requested_time_window_start_at === null ||
      row.requested_time_window_end_at === null ||
      row.latitude === null ||
      row.longitude === null ||
      row.route_stop_id === null
    ) {
      throw new TypeError("Route analysis stop data is incomplete.");
    }
    return [
      {
        routeStopId: row.route_stop_id,
        shipmentId: row.shipment_id,
        operationType: row.operation_type as RouteStopOperationType,
        location: { latitude: row.latitude, longitude: row.longitude },
        requestedTimeWindowStartAt: row.requested_time_window_start_at,
        requestedTimeWindowEndAt: row.requested_time_window_end_at,
        plannedArrivalAt: row.planned_arrival_at,
        plannedDepartureAt: row.planned_departure_at,
      },
    ];
  }
}
