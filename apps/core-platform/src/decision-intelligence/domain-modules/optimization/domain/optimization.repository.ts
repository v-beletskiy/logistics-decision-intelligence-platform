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
  abstract add(tenantId: string, optimization: Optimization): Promise<void>;
  abstract save(
    tenantId: string,
    loadedOptimization: LoadedOptimization,
  ): Promise<string>;
  abstract delete(tenantId: string, id: OptimizationId): Promise<void>;
}
