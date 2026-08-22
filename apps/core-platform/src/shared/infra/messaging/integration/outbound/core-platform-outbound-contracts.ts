import {
  optimizationJobEnqueuedV1,
  recommendationAnalysisRequestedV1,
} from "@logistics-decision-intelligence/integration-event-contracts";

/** Integration contracts owned and publishable by the Core Platform. */
export const corePlatformOutboundContracts = [
  recommendationAnalysisRequestedV1,
  optimizationJobEnqueuedV1,
] as const;
