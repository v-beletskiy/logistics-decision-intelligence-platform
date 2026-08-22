import { defineErrorCodes } from "../../../shared/domain/domain.exceptions";

export const DECISION_INTELLIGENCE_ERROR_CODES = defineErrorCodes(
  "decision-intelligence",
  {
    recommendationFactMetricIsInvalid: "recommendation-fact-metric-is-invalid",
    recommendationFactUnitIsInvalid: "recommendation-fact-unit-is-invalid",
  },
);
