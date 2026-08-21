import type { RouteId } from "../../../../operational-workspace/domain-modules/route/domain/route-id";
import type { Optimization } from "./optimization.aggregate";
import type { OptimizationId } from "./optimization-id";

export interface LoadedOptimization {
  readonly aggregate: Optimization;
  readonly expectedRevision: string;
}

export abstract class OptimizationRepository {
  abstract findById(
    tenantId: string,
    id: OptimizationId,
  ): Promise<LoadedOptimization | null>;
  abstract findActiveByRouteId(
    tenantId: string,
    routeId: RouteId,
  ): Promise<LoadedOptimization | null>;
  /**
   * Persists a newly queued optimization, enforcing the invariant that a route
   * has at most one active optimization. Returns whether it was accepted.
   */
  abstract add(
    tenantId: string,
    optimization: Optimization,
  ): Promise<boolean>;
  abstract save(
    tenantId: string,
    loadedOptimization: LoadedOptimization,
  ): Promise<string>;
  abstract delete(tenantId: string, id: OptimizationId): Promise<void>;
}
