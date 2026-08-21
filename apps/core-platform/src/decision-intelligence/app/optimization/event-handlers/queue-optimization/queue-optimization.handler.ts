import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { IntegrationEventFactory } from "@logistics-decision-intelligence/integration-events";
import { optimizationJobEnqueuedV1 } from "@logistics-decision-intelligence/integration-contracts";

import { IdentityType } from "../../../../../shared/access-control/identity/identity-type.enum";
import { ServiceScope } from "../../../../../shared/access-control/scopes/service-scope.enum";
import { ExecutionContext } from "../../../../../shared/app/execution/execution-context";
import {
  CommandHandler,
  type DomainEventsSource,
} from "../../../../../shared/app/handlers/command-handler";
import { ConcurrencyConflictException } from "../../../../../shared/app/app.exceptions";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { IntegrationEventPublisher } from "../../../../../shared/app/messaging/integration-event-publisher";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import {
  ROUTE_INPUT_CHANGED,
  type RouteInputChangedApplicationEvent,
} from "../../../../../operational-workspace/contracts/events/route-input-changed.application-event";
import { RouteId } from "../../../../../operational-workspace/domain-modules/route/domain/route-id";
import { RouteOptimizationInputReadContract } from "../../../../../operational-workspace/contracts/reads/route-optimization-input.read-contract";
import { Optimization } from "../../../../domain-modules/optimization/domain/optimization.aggregate";
import { OptimizationRepository } from "../../../../domain-modules/optimization/domain/optimization.repository";
import { OptimizationTriggerPolicy } from "../../../../domain-modules/optimization/domain/optimization-trigger.policy";
import { QueueOptimizationEventInput } from "./queue-optimization.event-input";

const QUEUE_OPTIMIZATION_SYSTEM_PRINCIPAL_ID =
  "00000000-0000-4000-8000-000000000001";

const OPTIMIZATION_SOURCE =
  "urn:logistics-decision-intelligence:decision-intelligence";

@Injectable()
export class QueueOptimizationHandler extends CommandHandler {
  private readonly integrationEventFactory = new IntegrationEventFactory(
    OPTIMIZATION_SOURCE,
  );

  constructor(
    private readonly optimizationRepository: OptimizationRepository,
    private readonly integrationEventPublisher: IntegrationEventPublisher,
    private readonly optimizationTriggerPolicy: OptimizationTriggerPolicy,
    private readonly routeInputReadContract: RouteOptimizationInputReadContract,
    transactionManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(transactionManager, domainEventBus);
  }

  @OnEvent(ROUTE_INPUT_CHANGED)
  async exec(event: RouteInputChangedApplicationEvent): Promise<void> {
    const input = new QueueOptimizationEventInput(
      event.payload.routeId,
      event.payload.tenantId,
    );
    const context = ExecutionContext.fromIdentity({
      id: QUEUE_OPTIMIZATION_SYSTEM_PRINCIPAL_ID,
      tenantId: input.tenantId,
      type: IdentityType.Service,
      scopes: [ServiceScope.RouteAnalysisRead],
    });
    const routeId = RouteId.from(input.routeId);

    const active = await this.optimizationRepository.findActiveByRouteId(
      context.tenantId,
      routeId,
    );
    const routeInput = await this.routeInputReadContract.get(
      context.tenantId,
      input.routeId,
    );
    if (
      !this.optimizationTriggerPolicy.shouldReoptimize({
        currentInputVersion: routeInput?.routeVersion,
        previousInputVersion: active?.aggregate.inputVersion,
      })
    ) {
      return;
    }

    await this.queueOptimization(context.tenantId, routeId);
  }

  /**
   * Queues an optimization for the route. The repository enforces at most one
   * active optimization per route; when one already exists it is cancelled and
   * replaced so concurrent input-change events converge to the latest one.
   */
  private async queueOptimization(
    tenantId: string,
    routeId: RouteId,
  ): Promise<void> {
    await this.execUseCaseTrx(async () => {
      const eventsFrom: DomainEventsSource[] = [];

      const optimization = Optimization.queue({ routeId });
      let inserted = await this.optimizationRepository.add(
        tenantId,
        optimization,
      );
      if (!inserted) {
        const active = await this.optimizationRepository.findActiveByRouteId(
          tenantId,
          routeId,
        );
        if (active) {
          active.aggregate.cancel();
          await this.optimizationRepository.save(tenantId, active);
          eventsFrom.push(active.aggregate);
        }
        inserted = await this.optimizationRepository.add(
          tenantId,
          optimization,
        );
      }
      if (!inserted) {
        throw new ConcurrencyConflictException(
          "Unable to queue an optimization for the route.",
        );
      }
      eventsFrom.push(optimization);

      await this.integrationEventPublisher.publish(
        this.integrationEventFactory.create(optimizationJobEnqueuedV1, {
          tenantid: tenantId,
          subject: optimization.id.value,
          data: {
            optimizationId: optimization.id.value,
            tenantId,
          },
        }),
      );

      return { result: undefined, eventsFrom };
    });
  }
}
