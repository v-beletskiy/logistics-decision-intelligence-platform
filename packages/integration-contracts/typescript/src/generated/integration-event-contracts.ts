/* This file is generated from JSON Schema. Do not edit it manually. */
import { defineContract } from "../contract";

import recommendationAnalysisCompletedV1Schema from "../../../schemas/ai-platform/recommendation-analysis/completed/v1.schema.json";
import type { RecommendationAnalysisCompletedV1Payload } from "./ai-platform/recommendation-analysis/completed/v1";
export type { RecommendationAnalysisCompletedV1Payload } from "./ai-platform/recommendation-analysis/completed/v1";

export const recommendationAnalysisCompletedV1 = defineContract<RecommendationAnalysisCompletedV1Payload>()(
  "recommendation-analysis.completed.v1",
  recommendationAnalysisCompletedV1Schema,
);

import optimizationJobEnqueuedV1Schema from "../../../schemas/core-platform/decision-intelligence/optimization-job-enqueued/v1.schema.json";
import type { OptimizationJobEnqueuedV1Payload } from "./core-platform/decision-intelligence/optimization-job-enqueued/v1";
export type { OptimizationJobEnqueuedV1Payload } from "./core-platform/decision-intelligence/optimization-job-enqueued/v1";

export const optimizationJobEnqueuedV1 = defineContract<OptimizationJobEnqueuedV1Payload>()(
  "decision-intelligence.optimization-job-enqueued.v1",
  optimizationJobEnqueuedV1Schema,
);

import recommendationAnalysisRequestedV1Schema from "../../../schemas/core-platform/decision-intelligence/recommendation-analysis-requested/v1.schema.json";
import type { RecommendationAnalysisRequestedV1Payload } from "./core-platform/decision-intelligence/recommendation-analysis-requested/v1";
export type { RecommendationAnalysisRequestedV1Payload } from "./core-platform/decision-intelligence/recommendation-analysis-requested/v1";

export const recommendationAnalysisRequestedV1 = defineContract<RecommendationAnalysisRequestedV1Payload>()(
  "decision-intelligence.recommendation-analysis-requested.v1",
  recommendationAnalysisRequestedV1Schema,
);
