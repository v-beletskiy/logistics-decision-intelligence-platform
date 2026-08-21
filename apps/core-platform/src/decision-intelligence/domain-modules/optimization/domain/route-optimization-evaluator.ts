import type { RouteOptimizationInputStop } from "./optimization.inputs";
import type { CostMatrix } from "./cost-matrix";
import { OptimizationCostModel } from "./optimization-cost-model";
import type { RouteMetrics } from "./route-metrics";
import { percentageChange } from "../../../shared-domain/shared-kernel/utils/percentage";

export interface RouteOptimizationEvaluation {
  readonly score: number;
  readonly baseline: RouteMetrics;
  readonly recommended: RouteMetrics;
  readonly distanceImprovementPercent: number;
  readonly durationImprovementPercent: number;
}

function routeDistance(
  order: readonly number[],
  matrix: readonly (readonly number[])[],
): number {
  let total = 0;
  for (let i = 0; i < order.length - 1; i += 1) {
    total += matrix[order[i]][order[i + 1]];
  }
  return total;
}

/** Evaluates an optimized route against its baseline using the business cost model. */
export class RouteOptimizationEvaluator {
  constructor(private readonly costModel: OptimizationCostModel) {}

  evaluate(input: {
    readonly stops: readonly RouteOptimizationInputStop[];
    readonly matrix: CostMatrix;
    readonly orderedStopIndexes: readonly number[];
  }): RouteOptimizationEvaluation {
    const baselineOrder = input.stops.map((_, index) => index);
    const baseline: RouteMetrics = {
      distanceKm: routeDistance(baselineOrder, input.matrix.distanceMatrix),
      durationSeconds: routeDistance(
        baselineOrder,
        input.matrix.durationMatrix,
      ),
    };
    const recommended: RouteMetrics = {
      distanceKm: routeDistance(
        input.orderedStopIndexes,
        input.matrix.distanceMatrix,
      ),
      durationSeconds: routeDistance(
        input.orderedStopIndexes,
        input.matrix.durationMatrix,
      ),
    };

    const baselineCost = this.costModel.calculate(baseline);
    const recommendedCost = this.costModel.calculate(recommended);
    const score =
      baselineCost > 0
        ? Math.max(
            0,
            Math.min(
              100,
              (100 * (baselineCost - recommendedCost)) / baselineCost,
            ),
          )
        : 0;

    return {
      score,
      baseline,
      recommended,
      distanceImprovementPercent: percentageChange(
        recommended.distanceKm,
        baseline.distanceKm,
      ),
      durationImprovementPercent: percentageChange(
        recommended.durationSeconds,
        baseline.durationSeconds,
      ),
    };
  }
}