import { Inject, Injectable } from "@nestjs/common";
import { recommendationAnalysisCompletedV2 } from "@logistics-decision-intelligence/integration-event-contracts";

import { ApplicationException } from "../../../../../../../shared/app/app.exceptions.js";
import { DomainException } from "../../../../../../../shared/domain/domain.exceptions.js";
import {
  APP_CONFIG,
  type WorkerAppConfig,
} from "../../../../../../../shared/infra/config/app-config.js";
import { NonRetryableMessageException } from "../../../../../../../shared/infra/messaging/integration/errors.js";
import { IntegrationJobWorker } from "../../../../../../../shared/infra/messaging/integration/inbound/integration-job-worker.js";
import { RabbitMqIntegrationEventConsumer } from "../../../../../../../shared/infra/messaging/integration/inbound/rabbitmq-integration-event-consumer.js";
import { defineSubscription } from "../../../../../../../shared/infra/messaging/integration/inbound/integration-subscription.js";
import { CompleteRecommendationAnalysisCommand } from "../../../app/commands/complete-recommendation-analysis/complete-recommendation-analysis.command.js";
import { CompleteRecommendationAnalysisHandler } from "../../../app/commands/complete-recommendation-analysis/complete-recommendation-analysis.handler.js";
import { FindingCategory } from "../../../domain/recommendation.enums.js";

const findingCategoryMapping: Record<string, FindingCategory> = {
  STRENGTH: FindingCategory.Strength,
  RISK: FindingCategory.Risk,
  ASSUMPTION: FindingCategory.Assumption,
};

export const RECOMMENDATION_ANALYSIS_COMPLETED_SUBSCRIPTION =
  defineSubscription({
    consumerId:
      "core-platform.decision-intelligence.recommendation-analysis-completed.v2",
    queue: "core-platform.decision-intelligence.recommendation-analysis-completed",
    contracts: [recommendationAnalysisCompletedV2],
  });

@Injectable()
export class RecommendationAnalysisCompletedConsumer extends IntegrationJobWorker {
  constructor(
    private readonly consumer: RabbitMqIntegrationEventConsumer,
    private readonly completeRecommendationAnalysis: CompleteRecommendationAnalysisHandler,
    @Inject(APP_CONFIG) config: WorkerAppConfig,
  ) {
    super(config);
  }

  protected async subscribe(): Promise<void> {
    await this.consumer.subscribe({
      ...RECOMMENDATION_ANALYSIS_COMPLETED_SUBSCRIPTION,
      handle: async (event) => {
        try {
          await this.completeRecommendationAnalysis.exec(
            new CompleteRecommendationAnalysisCommand(
              event.tenantid,
              event.data.recommendationId,
              event.data.requestEventId,
              {
                ...event.data.analysis,
                findings: event.data.analysis.findings.map((finding) => ({
                  ...finding,
                  category: findingCategoryMapping[finding.category]!,
                })),
              },
            ),
          );
        } catch (error: unknown) {
          if (
            error instanceof ApplicationException ||
            error instanceof DomainException
          ) {
            throw new NonRetryableMessageException(error.message);
          }
          throw error;
        }
      },
    });
  }
}
