import type { RouteStopDetails } from "../../../domain-modules/route/domain/route-stop.aggregate";
import { ShipmentId } from "../../../domain-modules/shipment/domain/shipment-id";
import type { RouteStopInput } from "../route.inputs";

export class RouteInputMapper {
  static toStopDetails(input: RouteStopInput): RouteStopDetails {
    return {
      shipmentId: ShipmentId.from(input.shipmentId),
      operationType: input.operationType,
      plannedArrivalAt: input.plannedArrivalAt,
      plannedDepartureAt: input.plannedDepartureAt,
    };
  }
}
