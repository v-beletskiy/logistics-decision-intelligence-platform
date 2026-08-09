import type { Route } from "./route.aggregate";
import type { RouteId } from "./route-id";
import type { ShipmentId } from "../../shipment/domain/shipment-id";

export abstract class RouteRepository {
  abstract findById(id: RouteId): Promise<Route | null>;
  abstract findByShipmentId(shipmentId: ShipmentId): Promise<readonly Route[]>;
  abstract save(route: Route): Promise<void>;
  abstract delete(id: RouteId): Promise<void>;
}
