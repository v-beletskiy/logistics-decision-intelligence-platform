import { Injectable } from "@nestjs/common";

import { AggregateNotFoundException } from "../../../../../../../shared/app/app.exceptions.js";
import { CommandHandler } from "../../../../../../../shared/app/handlers/command-handler.js";
import { DomainEventBus } from "../../../../../../../shared/app/messaging/domain-event-bus.js";
import { TrxManager } from "../../../../../../../shared/app/trx/trx-manager.js";
import { Finding } from "../../../domain/finding.entity.js";
import { RecommendationAnalysis } from "../../../domain/recommendation-analysis.value-object.js";
import { RecommendationId } from "../../../domain/recommendation-id.js";
import { RecommendationRepository } from "../../../domain/recommendation.repository.js";
import { CompleteRecommendationAnalysisCommand } from "./complete-recommendation-analysis.command.js";

@Injectable()
export class CompleteRecommendationAnalysisHandler extends CommandHandler {
  constructor(
    private readonly recommendationRepository: RecommendationRepository,
    trxManager: TrxManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  async exec(command: CompleteRecommendationAnalysisCommand): Promise<void> {
    await this.execUseCaseTrx(async () => {
      const loaded = await this.recommendationRepository.findById(
        command.tenantId,
        RecommendationId.from(command.recommendationId),
      );
      if (!loaded) throw new AggregateNotFoundException("Recommendation");

      const analysis = RecommendationAnalysis.create({
        summary: command.analysis.summary,
        confidence: command.analysis.confidence,
        findings: command.analysis.findings.map((finding) =>
          Finding.create(finding),
        ),
      });
      if (
        !loaded.aggregate.attachAnalysis(command.requestEventId, analysis)
      ) {
        return { result: undefined, eventsFrom: [] };
      }
      await this.recommendationRepository.save(command.tenantId, loaded);
      return { result: undefined, eventsFrom: [loaded.aggregate] };
    });
  }
}
