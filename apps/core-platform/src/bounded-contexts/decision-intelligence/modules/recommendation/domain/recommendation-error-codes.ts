import { defineErrorCodes } from "../../../../../shared/domain/domain.exceptions.js";

export const RECOMMENDATION_ERROR_CODES = defineErrorCodes(
  "decision-intelligence.recommendation",
  {
    recommendationTypeIsInvalid: "recommendation-type-is-invalid",
    recommendationStatusIsInvalid: "recommendation-status-is-invalid",
    recommendationFactsMustBeValidRecommendationFacts:
      "recommendation-facts-must-be-valid-recommendation-facts",
    recommendationHasAlreadyBeenAccepted:
      "recommendation-has-already-been-accepted",
    rejectedRecommendationCannotBeAccepted:
      "rejected-recommendation-cannot-be-accepted",
    expiredRecommendationCannotBeAccepted:
      "expired-recommendation-cannot-be-accepted",
    acceptedRecommendationCannotBeRejected:
      "accepted-recommendation-cannot-be-rejected",
    recommendationHasAlreadyBeenRejected:
      "recommendation-has-already-been-rejected",
    onlyAPendingRecommendationCanBeExpired:
      "only-a-pending-recommendation-can-be-expired",
    recommendationAnalysisMustBeValid: "recommendation-analysis-must-be-valid",
    analysisCanOnlyBeAttachedToAPendingRecommendation:
      "analysis-can-only-be-attached-to-a-pending-recommendation",
    findingCategoryIsInvalid: "finding-category-is-invalid",
    recommendationAnalysisConfidenceCannotExceed100:
      "recommendation-analysis-confidence-cannot-exceed-100",
    recommendationAnalysisFindingsAreInvalid:
      "recommendation-analysis-findings-are-invalid",
  },
);
