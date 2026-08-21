import type { CandidateRecommendation } from "./candidate-recommendation.value-object";
import type { Optimization } from "./optimization.aggregate";
import type { RouteOptimizationInput } from "./optimization.inputs";

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
