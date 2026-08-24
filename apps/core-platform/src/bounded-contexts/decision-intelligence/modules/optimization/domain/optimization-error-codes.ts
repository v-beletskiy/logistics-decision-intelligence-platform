import { defineErrorCodes } from "../../../../../shared/domain/domain.exceptions.js";

export const OPTIMIZATION_ERROR_CODES = defineErrorCodes(
  "decision-intelligence.optimization",
  {
    optimizationStatusIsInvalid: "optimization-status-is-invalid",
    onlyAQueuedOptimizationCanBeStarted:
      "only-a-queued-optimization-can-be-started",
    onlyARunningOptimizationCanBeCompleted:
      "only-a-running-optimization-can-be-completed",
    completedOptimizationCannotBeCancelled:
      "completed-optimization-cannot-be-cancelled",
    cancelledOptimizationCannotBeCancelledAgain:
      "cancelled-optimization-cannot-be-cancelled-again",
    failedOptimizationCannotBeCancelled:
      "failed-optimization-cannot-be-cancelled",
    completedOptimizationCannotBeFailed:
      "completed-optimization-cannot-be-failed",
    cancelledOptimizationCannotBeFailed:
      "cancelled-optimization-cannot-be-failed",
    failedOptimizationCannotBeFailedAgain:
      "failed-optimization-cannot-be-failed-again",
    candidateRecommendationTypeIsInvalid:
      "candidate-recommendation-type-is-invalid",
    candidateRecommendationFactsMustBeValidRecommendationFacts:
      "candidate-recommendation-facts-must-be-valid-recommendation-facts",
    candidateRecommendationProposedRoutePlanMustBeValid:
      "candidate-recommendation-proposed-route-plan-must-be-valid",
  },
);
