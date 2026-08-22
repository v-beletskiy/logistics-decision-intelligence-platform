import { Injectable } from "@nestjs/common";

import { AggregateNotFoundException } from "../../../../../../../shared/app/app.exceptions";
import {
  RoutePlanningSnapshotQuery,
  type RoutePlanningSnapshot,
  type RoutePlanningStopSnapshot,
} from "../../../../../public-api/queries/route-planning-snapshot.query";
import { GetRouteAnalysisContextHandler } from "../get-route-analysis-context/get-route-analysis-context.handler";
import { GetRouteAnalysisContextQuery } from "../get-route-analysis-context/get-route-analysis-context.query";
import type { RouteAnalysisStopResult } from "../get-route-analysis-context/get-route-analysis-context.result";

/** Maps the Route read model to Operational Workspace's published snapshot. */
@Injectable()
export class RoutePlanningSnapshotQueryAdapter implements RoutePlanningSnapshotQuery {
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
    shipmentId: stop.shipmentId,
    location: stop.location,
    plannedArrivalAt: stop.plannedArrivalAt,
    plannedDepartureAt: stop.plannedDepartureAt,
  };
}
