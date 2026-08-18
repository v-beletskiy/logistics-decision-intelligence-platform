import type { GeoCoordinateProps } from "../../../../shared/domain/shared-kernel/value-objects/location/geo-coordinate";
import type { CandidateRecommendation } from "./candidate-recommendation.value-object";
import type { Optimization } from "./optimization.aggregate";

export interface RouteOptimizationInputStop {
  readonly shipmentId: string;
  readonly location: GeoCoordinateProps;
  readonly plannedArrivalAt: Date;
  readonly plannedDepartureAt: Date;
}

export interface RouteOptimizationInput {
  readonly routeId: string;
  readonly routeVersion: number;
  readonly stops: readonly RouteOptimizationInputStop[];
}

/**
 * Executes an Optimization and produces actionable Recommendation candidates.
 * The concrete implementation is provided in a later phase.
 */
export abstract class OptimizationExecutionService {
  abstract exec(
    optimization: Optimization,
    input: RouteOptimizationInput,
  ): Promise<readonly CandidateRecommendation[]>;
}
