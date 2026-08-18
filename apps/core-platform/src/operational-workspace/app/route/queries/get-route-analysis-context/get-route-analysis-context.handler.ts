import { Injectable } from "@nestjs/common";

import { AggregateNotFoundException } from "../../../../../shared/app/app.exceptions";
import { RouteStopOperationType } from "../../../../domain-modules/route/domain/route-stop.aggregate";
import { RouteRepository } from "../../../../domain-modules/route/domain/route.repository";
import { RouteId } from "../../../../domain-modules/route/domain/route-id";
import { RouteStopRepository } from "../../../../domain-modules/route/domain/route-stop.repository";
import { ShipmentRepository } from "../../../../domain-modules/shipment/domain/shipment.repository";
import { GetRouteAnalysisContextQuery } from "./get-route-analysis-context.query";
import type {
  RouteAnalysisContextResult,
  RouteAnalysisStopResult,
} from "./get-route-analysis-context.result";

@Injectable()
export class GetRouteAnalysisContextHandler {
  constructor(
    private readonly routeRepository: RouteRepository,
    private readonly routeStopRepository: RouteStopRepository,
    private readonly shipmentRepository: ShipmentRepository,
  ) {}

  async exec(
    query: GetRouteAnalysisContextQuery,
  ): Promise<RouteAnalysisContextResult> {
    const routeId = RouteId.from(query.routeId);
    const loadedRoute = await this.routeRepository.findById(
      query.tenantId,
      routeId,
    );
    if (!loadedRoute) {
      throw new AggregateNotFoundException("Route");
    }

    const stops = await this.routeStopRepository.findAllByRouteId(
      query.tenantId,
      routeId,
    );
    const shipments = await this.shipmentRepository.findByIds(query.tenantId, [
      ...new Map(
        stops.map((stop) => [
          stop.aggregate.shipmentId.value,
          stop.aggregate.shipmentId,
        ]),
      ).values(),
    ]);
    const shipmentByKey = new Map(
      shipments.map((shipment) => [shipment.id.value, shipment]),
    );

    return {
      routeId: loadedRoute.aggregate.id.value,
      routeVersion: Number(loadedRoute.expectedRevision),
      stops: stops.map(({ aggregate: stop }) => {
        const shipment = shipmentByKey.get(stop.shipmentId.value);
        if (!shipment) {
          throw new AggregateNotFoundException(
            `Shipment for route stop ${stop.id.value}.`,
          );
        }
        const location =
          stop.operationType === RouteStopOperationType.Pickup
            ? shipment.pickup.location
            : shipment.delivery.location;
        return {
          shipmentId: stop.shipmentId.value,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          plannedArrivalAt: stop.plannedArrivalAt,
          plannedDepartureAt: stop.plannedDepartureAt,
        } satisfies RouteAnalysisStopResult;
      }),
    } satisfies RouteAnalysisContextResult;
  }
}
