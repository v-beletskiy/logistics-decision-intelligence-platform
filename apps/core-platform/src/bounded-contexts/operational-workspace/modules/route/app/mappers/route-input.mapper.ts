import type { RouteStopPlan } from "../../domain/route-stop.aggregate";
import { ShipmentId } from "../../../shipment/domain/shipment-id";
import type { RouteStopPlanInput } from "../models/route-stop-plan.input";

export class RouteInputMapper {
  static toStopPlan(input: RouteStopPlanInput): RouteStopPlan {
    return {
      shipmentId: ShipmentId.from(input.shipmentId),
      operationType: input.operationType,
      plannedArrivalAt: input.plannedArrivalAt,
      plannedDepartureAt: input.plannedDepartureAt,
    };
  }
}
