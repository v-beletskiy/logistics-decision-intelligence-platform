import type { OptimizationStop } from "../../domain/optimization-stop.js";

export interface RouteOptimizationInput {
  readonly routeId: string;
  readonly routeVersion: number;
  readonly fixedOrigin: OptimizationStop;
  readonly stops: readonly OptimizationStop[];
}

/** Decision Intelligence port for loading an optimization-ready Route input. */
export abstract class RouteOptimizationInputQuery {
  abstract get(
    tenantId: string,
    routeId: string,
  ): Promise<RouteOptimizationInput | null>;
}
