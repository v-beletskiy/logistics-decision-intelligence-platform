import type { RouteStopOperationType } from "../../domain/route-stop.aggregate.js";

/** One stop plan accepted by the create-route use case. */
export interface RouteStopPlanInput {
  readonly shipmentId: string;
  readonly operationType: RouteStopOperationType;
  readonly plannedArrivalAt: Date;
  readonly plannedDepartureAt: Date;
}
