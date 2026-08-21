import { Injectable } from "@nestjs/common";

import { AggregateNotFoundException } from "../../../../shared/app/app.exceptions";
import {
  RouteOptimizationInputReadContract,
  type RouteOptimizationInput,
} from "../../../contracts/reads/route-optimization-input.read-contract";
import { GetRouteAnalysisContextHandler } from "../../../app/route/queries/get-route-analysis-context/get-route-analysis-context.handler";
import { GetRouteAnalysisContextQuery } from "../../../app/route/queries/get-route-analysis-context/get-route-analysis-context.query";

/** OW adapter exposing its route read model through the published read contract. */
@Injectable()
export class RouteOptimizationInputReadContractProvider
  implements RouteOptimizationInputReadContract
{
  constructor(
    private readonly getRouteAnalysisContext: GetRouteAnalysisContextHandler,
  ) {}

  async get(
    tenantId: string,
    routeId: string,
  ): Promise<RouteOptimizationInput | null> {
    try {
      const context = await this.getRouteAnalysisContext.exec(
        new GetRouteAnalysisContextQuery(tenantId, routeId),
      );
      return {
        routeId: context.routeId,
        routeVersion: context.routeVersion,
        stops: context.stops.map((stop) => ({
          shipmentId: stop.shipmentId,
          location: stop.location,
          plannedArrivalAt: stop.plannedArrivalAt,
          plannedDepartureAt: stop.plannedDepartureAt,
        })),
      };
    } catch (error: unknown) {
      if (error instanceof AggregateNotFoundException) {
        return null;
      }
      throw error;
    }
  }
}