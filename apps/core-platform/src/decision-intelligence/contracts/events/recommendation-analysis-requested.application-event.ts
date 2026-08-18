import type { InternalApplicationEvent } from "../../../shared/app/messaging/internal-application-event-bus";

/** Trigger for the AI Platform to analyze a pending recommendation (IDs only). */
export type RecommendationAnalysisRequestedApplicationEvent =
  InternalApplicationEvent<{
    readonly recommendationId: string;
    readonly routeId: string;
    readonly tenantId: string;
  }> & {
    readonly type: "RecommendationAnalysisRequested";
  };

export const RECOMMENDATION_ANALYSIS_REQUESTED =
  "RecommendationAnalysisRequested";

export function recommendationAnalysisRequestedAppEvent(payload: {
  readonly recommendationId: string;
  readonly routeId: string;
  readonly tenantId: string;
}): RecommendationAnalysisRequestedApplicationEvent {
  return { type: RECOMMENDATION_ANALYSIS_REQUESTED, payload };
}
