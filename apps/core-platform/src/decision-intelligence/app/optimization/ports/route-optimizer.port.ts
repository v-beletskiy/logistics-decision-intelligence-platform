import type { RouteOptimizationInputStop } from "../../../domain-modules/optimization/domain/optimization.inputs";
import type { CostMatrix } from "../../../domain-modules/optimization/domain/cost-matrix";
import type { RouteOptimizationSolution } from "../models/route-optimization-solution";

export interface RouteOptimizationProblem {
  readonly stops: readonly RouteOptimizationInputStop[];
  readonly matrix: CostMatrix;
}

/** Optimizes a route problem with an external solver. */
export abstract class RouteOptimizer {
  abstract optimize(
    problem: RouteOptimizationProblem,
  ): Promise<RouteOptimizationSolution>;
}