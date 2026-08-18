import type { RouteStopInput } from "../../../app/route/route.inputs";
import { RouteStopOperationType } from "../../../domain-modules/route/domain/route-stop.aggregate";
import type {
  CreateRouteRequest,
  CreatedRouteResponse,
} from "./route.http-contracts";

export class RouteHttpMapper {
  static toRouteStopsInput(request: CreateRouteRequest): RouteStopInput[] {
    return request.stops.map((stop) => ({
      shipmentId: stop.shipmentId,
      operationType: stop.operationType as RouteStopOperationType,
      plannedArrivalAt: new Date(stop.plannedArrivalAt),
      plannedDepartureAt: new Date(stop.plannedDepartureAt),
    }));
  }

  static toCreatedRouteResponse(routeId: string): CreatedRouteResponse {
    return { id: routeId };
  }
}