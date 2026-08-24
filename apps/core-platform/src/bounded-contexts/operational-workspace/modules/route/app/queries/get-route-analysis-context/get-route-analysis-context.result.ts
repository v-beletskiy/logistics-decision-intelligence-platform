import type { GeoCoordinateProps } from "../../../../../../../shared/domain/value-objects/location/geo-coordinate.js";
import type { RouteStopOperationType } from "../../../domain/route-stop.aggregate.js";

export interface RouteAnalysisContextResult {
  readonly routeId: string;
  readonly routeVersion: number;
  readonly stops: readonly RouteAnalysisStopResult[];
}

export interface RouteAnalysisStopResult {
  readonly routeStopId: string;
  readonly shipmentId: string;
  readonly operationType: RouteStopOperationType;
  readonly location: GeoCoordinateProps;
  readonly requestedTimeWindowStartAt: Date;
  readonly requestedTimeWindowEndAt: Date;
  readonly plannedArrivalAt: Date;
  readonly plannedDepartureAt: Date;
}
