import type { RouteStopPlanInput } from "../../app/models/route-stop-plan.input.js";
import { RouteStopOperationType } from "../../domain/route-stop.aggregate.js";
import type {
  CreateRouteRequest,
  CreatedRouteResponse,
} from "./route.http-contracts.js";

export class RouteHttpMapper {
  static toRouteStopsInput(request: CreateRouteRequest): RouteStopPlanInput[] {
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
