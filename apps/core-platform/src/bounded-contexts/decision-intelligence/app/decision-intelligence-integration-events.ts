import { IntegrationEventFactory } from "@logistics-decision-intelligence/integration-events";

/** Creates integration events for the stable Decision Intelligence producer. */
export const decisionIntelligenceIntegrationEventFactory =
  new IntegrationEventFactory(
    "urn:logistics-decision-intelligence:decision-intelligence",
  );
