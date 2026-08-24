import type { RouteStop } from "./route-stop.aggregate.js";
import type { RouteId } from "./route-id.js";
import type { RouteStopId } from "./route-stop-id.js";

export interface LoadedRouteStop {
  readonly aggregate: RouteStop;
  readonly expectedRevision: string;
}

export abstract class RouteStopRepository {
  abstract findById(
    tenantId: string,
    id: RouteStopId,
  ): Promise<LoadedRouteStop | null>;
  abstract findByRouteIdAndSequence(
    tenantId: string,
    routeId: RouteId,
    sequence: number,
  ): Promise<LoadedRouteStop | null>;
  abstract findAllByRouteId(
    tenantId: string,
    routeId: RouteId,
  ): Promise<readonly LoadedRouteStop[]>;
  abstract findByRouteIdAndSequenceForUpdate(
    tenantId: string,
    routeId: RouteId,
    sequence: number,
  ): Promise<LoadedRouteStop | null>;
  abstract addMany(
    tenantId: string,
    stops: readonly RouteStop[],
  ): Promise<void>;
  abstract save(
    tenantId: string,
    loadedRouteStop: LoadedRouteStop,
  ): Promise<string>;
}
