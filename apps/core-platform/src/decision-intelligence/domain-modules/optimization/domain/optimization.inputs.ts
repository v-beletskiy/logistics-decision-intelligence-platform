import type { GeoCoordinateProps } from "../../../../shared/domain/shared-kernel/value-objects/location/geo-coordinate";

export interface RouteOptimizationInputStop {
  readonly shipmentId: string;
  readonly location: GeoCoordinateProps;
  readonly plannedArrivalAt: Date;
  readonly plannedDepartureAt: Date;
}

export interface RouteOptimizationInput {
  readonly routeId: string;
  readonly routeVersion: number;
  readonly stops: readonly RouteOptimizationInputStop[];
}
