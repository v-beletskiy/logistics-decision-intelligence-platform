import type { GeoCoordinateProps } from "../../../shared/domain/shared-kernel/value-objects/location/geo-coordinate";

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

/** Read contract for inter-BC reads of the route optimization input (ADR-0003). */
export abstract class RouteOptimizationInputReadContract {
  abstract get(
    tenantId: string,
    routeId: string,
  ): Promise<RouteOptimizationInput | null>;
}