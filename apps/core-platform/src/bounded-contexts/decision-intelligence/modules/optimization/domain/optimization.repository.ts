import type { RouteReference } from "../../../domain/route-reference";
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
  /**
   * Serializes replacement decisions for the Route and returns its active
   * Optimization, if any. Must be called inside the use-case transaction.
   */
  abstract findActiveByRouteIdForReplacement(
    tenantId: string,
    routeId: RouteReference,
  ): Promise<LoadedOptimization | null>;
  /**
   * Persists a newly queued Optimization, with the database constraint as the
   * final safeguard that a Route has at most one active Optimization.
   */
  abstract add(tenantId: string, optimization: Optimization): Promise<void>;
  abstract save(
    tenantId: string,
    loadedOptimization: LoadedOptimization,
  ): Promise<string>;
  abstract delete(tenantId: string, id: OptimizationId): Promise<void>;
}
