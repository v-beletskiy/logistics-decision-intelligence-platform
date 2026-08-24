import type { Route } from "./route.aggregate.js";
import type { RouteId } from "./route-id.js";

export interface LoadedRoute {
  readonly aggregate: Route;
  readonly expectedRevision: string;
}

export abstract class RouteRepository {
  abstract findById(tenantId: string, id: RouteId): Promise<LoadedRoute | null>;
  abstract findByIdForUpdate(
    tenantId: string,
    id: RouteId,
  ): Promise<LoadedRoute | null>;
  abstract add(tenantId: string, route: Route): Promise<void>;
  abstract save(tenantId: string, loadedRoute: LoadedRoute): Promise<string>;
}
