import type { GeoCoordinateProps } from "../../../../../../../shared/domain/value-objects/location/geo-coordinate.js";

export interface RouteAnalysisContextResult {
  readonly routeId: string;
  readonly routeVersion: number;
  readonly stops: readonly RouteAnalysisStopResult[];
}

export interface RouteAnalysisStopResult {
  readonly shipmentId: string;
  readonly location: GeoCoordinateProps;
  readonly plannedArrivalAt: Date;
  readonly plannedDepartureAt: Date;
}
