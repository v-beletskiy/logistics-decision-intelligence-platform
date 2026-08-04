import type { Route } from "./route.aggregate";
import type { RouteId } from "./route-id";

export abstract class RouteRepository {
  abstract findById(id: RouteId): Promise<Route | null>;
  abstract findByShipmentId(shipmentId: string): Promise<readonly Route[]>;
  abstract save(route: Route): Promise<void>;
  abstract delete(id: RouteId): Promise<void>;
}
