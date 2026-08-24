import type { GeoCoordinateProps } from "../../../../../shared/domain/value-objects/location/geo-coordinate.js";

export interface OptimizationStop {
  readonly shipmentId: string;
  readonly location: GeoCoordinateProps;
  readonly plannedArrivalAt: Date;
  readonly plannedDepartureAt: Date;
}
