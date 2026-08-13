import type { RouteStopDetails } from "../../domain-modules/route/domain/route-stop.aggregate";

export interface RouteStopInput
  extends Pick<
    RouteStopDetails,
    "operationType" | "plannedArrivalAt" | "plannedDepartureAt"
  > {
  readonly shipmentId: string;
}
