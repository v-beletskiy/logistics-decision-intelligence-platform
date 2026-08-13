import type { RouteStop } from "./route-stop.aggregate";
import type { RouteId } from "./route-id";
import type { RouteStopId } from "./route-stop-id";

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
