import { Injectable } from "@nestjs/common";

import { ApplicationInvariantViolationException } from "../../../../../../shared/app/app.exceptions.js";
import {
  RoutePlanningSnapshotQuery,
  RoutePlanningStopOperationType,
  type RoutePlanningStopSnapshot,
} from "../../../../../operational-workspace/public-api/queries/route-planning-snapshot.query.js";
import {
  OptimizationStopOperationType,
  type OptimizationStop,
} from "../../domain/optimization-stop.js";
import {
  RouteOptimizationInputQuery,
  type RouteOptimizationInput,
} from "../../app/ports/route-optimization-input.query.js";

const routeStopOperationTypeMapping: Record<
  RoutePlanningStopOperationType,
  OptimizationStopOperationType
> = {
  [RoutePlanningStopOperationType.Pickup]: OptimizationStopOperationType.Pickup,
  [RoutePlanningStopOperationType.Delivery]: OptimizationStopOperationType.Delivery,
};

/** Consumer-owned query adapter from Operational Workspace to Optimization input. */
@Injectable()
export class RouteOptimizationInputQueryAdapter implements RouteOptimizationInputQuery {
  constructor(private readonly snapshotQuery: RoutePlanningSnapshotQuery) {}

  async get(
    tenantId: string,
    routeId: string,
  ): Promise<RouteOptimizationInput | null> {
    const snapshot = await this.snapshotQuery.get(tenantId, routeId);
    if (!snapshot) return null;

    const [fixedOrigin, ...stops] =
      snapshot.orderedStops.map(toOptimizationStop);
    if (!fixedOrigin) {
      throw new ApplicationInvariantViolationException(
        "A route optimization input requires a fixed origin stop.",
      );
    }
    return {
      routeId: snapshot.routeId,
      routeVersion: snapshot.routeVersion,
      fixedOrigin,
      stops,
    };
  }
}

function toOptimizationStop(stop: RoutePlanningStopSnapshot): OptimizationStop {
  return {
    routeStopId: stop.routeStopId,
    shipmentId: stop.shipmentId,
    operationType: routeStopOperationTypeMapping[stop.operationType],
    location: stop.location,
    requestedTimeWindowStartAt: stop.requestedTimeWindowStartAt,
    requestedTimeWindowEndAt: stop.requestedTimeWindowEndAt,
    plannedArrivalAt: stop.plannedArrivalAt,
    plannedDepartureAt: stop.plannedDepartureAt,
  };
}
