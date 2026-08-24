import { Injectable } from "@nestjs/common";

import { AggregateNotFoundException } from "../../../../../../../shared/app/app.exceptions.js";
import {
  RoutePlanningSnapshotQuery,
  RoutePlanningStopOperationType,
  type RoutePlanningSnapshot,
  type RoutePlanningStopSnapshot,
} from "../../../../../public-api/queries/route-planning-snapshot.query.js";
import { RouteStopOperationType } from "../../../domain/route-stop.aggregate.js";
import { GetRouteAnalysisContextHandler } from "../get-route-analysis-context/get-route-analysis-context.handler.js";
import { GetRouteAnalysisContextQuery } from "../get-route-analysis-context/get-route-analysis-context.query.js";
import type { RouteAnalysisStopResult } from "../get-route-analysis-context/get-route-analysis-context.result.js";

const routeStopOperationTypeMapping: Record<
  RouteStopOperationType,
  RoutePlanningStopOperationType
> = {
  [RouteStopOperationType.Pickup]: RoutePlanningStopOperationType.Pickup,
  [RouteStopOperationType.Delivery]: RoutePlanningStopOperationType.Delivery,
};

/** Maps the Route read model to Operational Workspace's published snapshot. */
@Injectable()
export class RoutePlanningSnapshotHandler implements RoutePlanningSnapshotQuery {
  constructor(
    private readonly getRouteAnalysisContext: GetRouteAnalysisContextHandler,
  ) {}

  async get(
    tenantId: string,
    routeId: string,
  ): Promise<RoutePlanningSnapshot | null> {
    try {
      const context = await this.getRouteAnalysisContext.exec(
        new GetRouteAnalysisContextQuery(tenantId, routeId),
      );
      return {
        routeId: context.routeId,
        routeVersion: context.routeVersion,
        orderedStops: context.stops.map(toPlanningStopSnapshot),
      };
    } catch (error: unknown) {
      if (error instanceof AggregateNotFoundException) {
        return null;
      }
      throw error;
    }
  }
}

function toPlanningStopSnapshot(
  stop: RouteAnalysisStopResult,
): RoutePlanningStopSnapshot {
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
