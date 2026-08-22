import { ROUTE_ERROR_CODES } from "./route-error-codes";
import { DomainException } from "../../../../../shared/domain/domain.exceptions";

import {
  RouteStopOperationType,
  type RouteStopPlan,
} from "./route-stop.aggregate";

/** Validates cross-stop planning invariants without creating or mutating domain state. */
export class RoutePlanningPolicy {
  assertCanCreate(stops: readonly RouteStopPlan[]): void {
    if (!Array.isArray(stops) || stops.length < 2) {
      throw new DomainException(
        "A route must contain at least one pickup and one delivery stop.",
        ROUTE_ERROR_CODES.routeMustContainAtLeastOnePickupAndOneDeliveryStop,
      );
    }

    const operationsByShipment = new Map<
      string,
      Map<RouteStopOperationType, number>
    >();
    for (const [index, stop] of stops.entries()) {
      const shipmentId = stop.shipmentId.value;
      const operations = operationsByShipment.get(shipmentId) ?? new Map();
      if (operations.has(stop.operationType)) {
        throw new DomainException(
          `A route may contain only one ${stop.operationType.toLowerCase()} stop per shipment.`,
          ROUTE_ERROR_CODES.duplicateShipmentStopOperation,
        );
      }
      operations.set(stop.operationType, index);
      operationsByShipment.set(shipmentId, operations);
    }

    for (const [shipmentId, operations] of operationsByShipment) {
      const pickup = operations.get(RouteStopOperationType.Pickup);
      const delivery = operations.get(RouteStopOperationType.Delivery);
      if (pickup === undefined || delivery === undefined) {
        throw new DomainException(
          `Shipment ${shipmentId} requires both pickup and delivery route stops.`,
          ROUTE_ERROR_CODES.shipmentStopPairIsIncomplete,
        );
      }
      if (pickup > delivery) {
        throw new DomainException(
          `The pickup for shipment ${shipmentId} must precede its delivery.`,
          ROUTE_ERROR_CODES.shipmentPickupMustPrecedeDelivery,
        );
      }
    }
  }
}
