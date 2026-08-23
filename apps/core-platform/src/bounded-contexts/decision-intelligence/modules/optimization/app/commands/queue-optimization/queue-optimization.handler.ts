import { Injectable } from "@nestjs/common";
import { optimizationJobEnqueuedV1 } from "@logistics-decision-intelligence/integration-event-contracts";

import type { UseCaseRequest } from "../../../../../../../shared/modules/access-control/app/execution/use-case-context";
import {
  CommandHandler,
  type DomainEventsSource,
} from "../../../../../../../shared/app/handlers/command-handler";
import { AggregateNotFoundException } from "../../../../../../../shared/app/app.exceptions";
import { DomainEventBus } from "../../../../../../../shared/app/messaging/domain-event-bus";
import { IntegrationEventPublisher } from "../../../../../../../shared/app/messaging/integration-event-publisher";
import { TrxManager } from "../../../../../../../shared/app/trx/trx-manager";
import { decisionIntelligenceIntegrationEventFactory } from "../../../../../app/decision-intelligence-integration-events";
import { RouteReference } from "../../../../../domain/route-reference";
import { Optimization } from "../../../domain/optimization.aggregate";
import { OptimizationRepository } from "../../../domain/optimization.repository";
import { OptimizationTriggerPolicy } from "../../../domain/optimization-trigger.policy";
import { RouteOptimizationInputQuery } from "../../ports/route-optimization-input.query";
import { QueueOptimizationCommand } from "./queue-optimization.command";

@Injectable()
export class QueueOptimizationHandler extends CommandHandler {
  constructor(
    private readonly optimizationRepository: OptimizationRepository,
    private readonly integrationEventPublisher: IntegrationEventPublisher,
    private readonly optimizationTriggerPolicy: OptimizationTriggerPolicy,
    private readonly routeInputQuery: RouteOptimizationInputQuery,
    trxManager: TrxManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  async exec(request: UseCaseRequest<QueueOptimizationCommand>): Promise<void> {
    const { context, input: command } = request;
    const routeId = RouteReference.from(command.routeId);
    await this.execUseCaseTrx(async () => {
      const eventsFrom: DomainEventsSource[] = [];
      const routeInput = await this.routeInputQuery.get(
        context.tenantId,
        command.routeId,
      );
      if (!routeInput) {
        throw new AggregateNotFoundException("Route");
      }

      const active =
        await this.optimizationRepository.findActiveByRouteIdForUpdate(
          context.tenantId,
          routeId,
        );
      if (
        !this.optimizationTriggerPolicy.shouldReoptimize({
          currentInputVersion: routeInput.routeVersion,
          previousInputVersion: active?.aggregate.inputVersion,
        })
      ) {
        return { result: undefined, eventsFrom };
      }

      const optimization = Optimization.queue({
        routeId,
        inputVersion: routeInput.routeVersion,
      });
      if (active) {
        active.aggregate.cancel();
        await this.optimizationRepository.save(context.tenantId, active);
        eventsFrom.push(active.aggregate);
      }

      await this.optimizationRepository.add(context.tenantId, optimization);
      eventsFrom.push(optimization);

      await this.integrationEventPublisher.publish(
        decisionIntelligenceIntegrationEventFactory.create(
          optimizationJobEnqueuedV1,
          {
            tenantid: context.tenantId,
            subject: optimization.id.value,
            data: {
              optimizationId: optimization.id.value,
              tenantId: context.tenantId,
            },
          },
        ),
      );

      return { result: undefined, eventsFrom };
    });
  }
}
