import type { OptimizationStop } from "../../domain/optimization-stop";
import type { CostMatrix } from "../../domain/cost-matrix";
import type { RouteMetrics } from "../../domain/route-metrics";

export interface RouteOptimizationProblem {
  /** A fixed stop anchoring the route; it is never submitted as a VROOM job. */
  readonly fixedOrigin: OptimizationStop;
  readonly stops: readonly OptimizationStop[];
  readonly matrix: CostMatrix;
}

/** Neutral solver output, free of recommendation semantics. */
export interface RouteOptimizationSolution {
  /** Indexes into `[fixedOrigin, ...stops]` in visit order. */
  readonly orderedStopIndexes: readonly number[];
  readonly metrics: RouteMetrics;
}

/** Optimizes a route problem with an external solver. */
export abstract class RouteOptimizer {
  abstract optimize(
    problem: RouteOptimizationProblem,
  ): Promise<RouteOptimizationSolution>;
}
