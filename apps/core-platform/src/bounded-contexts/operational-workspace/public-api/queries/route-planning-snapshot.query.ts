import type { GeoCoordinateProps } from "../../../../shared/domain/value-objects/location/geo-coordinate.js";

export enum RoutePlanningStopOperationType {
  Pickup = "PICKUP",
  Delivery = "DELIVERY",
}

export interface RoutePlanningStopSnapshot {
  readonly routeStopId: string;
  readonly shipmentId: string;
  readonly operationType: RoutePlanningStopOperationType;
  readonly location: GeoCoordinateProps;
  readonly requestedTimeWindowStartAt: Date;
  readonly requestedTimeWindowEndAt: Date;
  readonly plannedArrivalAt: Date;
  readonly plannedDepartureAt: Date;
}

/** Read-only Route planning data published for in-process context integrations. */
export interface RoutePlanningSnapshot {
  readonly routeId: string;
  readonly routeVersion: number;
  readonly orderedStops: readonly RoutePlanningStopSnapshot[];
}

/** Provider-owned public query expressed in Operational Workspace language. */
export abstract class RoutePlanningSnapshotQuery {
  abstract get(
    tenantId: string,
    routeId: string,
  ): Promise<RoutePlanningSnapshot | null>;
}
