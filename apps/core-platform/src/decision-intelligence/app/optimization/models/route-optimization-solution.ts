import type { RouteMetrics } from "../../../domain-modules/optimization/domain/route-metrics";

/** The neutral solution produced by a route optimizer, free of recommendation semantics. */
export interface RouteOptimizationSolution {
  /** Indexes into the input stops in visit order, including the origin (first stop). */
  readonly orderedStopIndexes: readonly number[];
  readonly metrics: RouteMetrics;
}