import type { RouteMetrics } from "./route-metrics.js";

const DISTANCE_COST_PER_KM = 1;
const DURATION_COST_PER_MINUTE = 1;

/** Business weights for the route cost objective: distance and duration. */
export class OptimizationCostModel {
  readonly distanceCostPerKm: number = DISTANCE_COST_PER_KM;
  readonly durationCostPerMinute: number = DURATION_COST_PER_MINUTE;

  private constructor() {}

  static create(): OptimizationCostModel {
    return new OptimizationCostModel();
  }

  calculate(metrics: RouteMetrics): number {
    return (
      this.distanceCostPerKm * metrics.distanceKm +
      (this.durationCostPerMinute * metrics.durationSeconds) / 60
    );
  }
}
