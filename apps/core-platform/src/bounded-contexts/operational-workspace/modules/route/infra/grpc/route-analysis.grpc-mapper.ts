import type {
  RouteAnalysisContext,
  RouteStopOperationType,
  RouteStop,
} from "../../../../../../shared/infra/grpc/generated/operational_workspace/v1/route_analysis_types.js";
import type { GeoPoint } from "../../../../../../shared/infra/grpc/generated/shared/v1/geography.js";
import type { RouteAnalysisContextResult } from "../../app/queries/get-route-analysis-context/get-route-analysis-context.result.js";

export class RouteAnalysisGrpcMapper {
  static toRouteAnalysisContext(
    context: RouteAnalysisContextResult,
  ): RouteAnalysisContext {
    return {
      routeId: context.routeId,
      routeVersion: context.routeVersion,
      stops: context.stops.map((stop): RouteStop => {
        const location: GeoPoint = {
          latitude: stop.location.latitude,
          longitude: stop.location.longitude,
        };
        return {
          routeStopId: stop.routeStopId,
          shipmentId: stop.shipmentId,
          operationType: toGrpcOperationType(stop.operationType),
          location,
          requestedTimeWindowStartAt: stop.requestedTimeWindowStartAt,
          requestedTimeWindowEndAt: stop.requestedTimeWindowEndAt,
          plannedArrivalAt: stop.plannedArrivalAt,
          plannedDepartureAt: stop.plannedDepartureAt,
        };
      }),
    };
  }
}

function toGrpcOperationType(
  operationType: "PICKUP" | "DELIVERY",
): RouteStopOperationType {
  return operationType === "PICKUP"
    ? 1
    : 2;
}
