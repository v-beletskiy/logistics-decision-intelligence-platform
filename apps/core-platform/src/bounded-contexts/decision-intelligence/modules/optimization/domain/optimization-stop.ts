import type { GeoCoordinateProps } from "../../../../../shared/domain/value-objects/location/geo-coordinate.js";

export enum OptimizationStopOperationType {
  Pickup = "PICKUP",
  Delivery = "DELIVERY",
}

export interface OptimizationStop {
  readonly routeStopId: string;
  readonly shipmentId: string;
  readonly operationType: OptimizationStopOperationType;
  readonly location: GeoCoordinateProps;
  readonly requestedTimeWindowStartAt: Date;
  readonly requestedTimeWindowEndAt: Date;
  readonly plannedArrivalAt: Date;
  readonly plannedDepartureAt: Date;
}
