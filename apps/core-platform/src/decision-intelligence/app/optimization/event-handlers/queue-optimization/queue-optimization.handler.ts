import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

import { IdentityType } from "../../../../../shared/access-control/identity/identity-type.enum";
import { ServiceScope } from "../../../../../shared/access-control/scopes/service-scope.enum";
import { ExecutionContext } from "../../../../../shared/app/execution/execution-context";
import {
  CommandHandler,
  type DomainEventsSource,
} from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import {
  ROUTE_INPUT_CHANGED,
  type RouteInputChangedApplicationEvent,
} from "../../../../../operational-workspace/contracts/events/route-input-changed.application-event";
import { RouteId } from "../../../../../operational-workspace/domain-modules/route/domain/route-id";
import { Optimization } from "../../../../domain-modules/optimization/domain/optimization.aggregate";
import { OptimizationRepository } from "../../../../domain-modules/optimization/domain/optimization.repository";
import { QueueOptimizationEventInput } from "./queue-optimization.event-input";

const QUEUE_OPTIMIZATION_SYSTEM_PRINCIPAL_ID =
  "00000000-0000-4000-8000-000000000001";

@Injectable()
export class QueueOptimizationHandler extends CommandHandler {
  constructor(
    private readonly optimizationRepository: OptimizationRepository,
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

    await this.execUseCaseTrx(async () => {
      const routeId = RouteId.from(input.routeId);
      const eventsFrom: DomainEventsSource[] = [];

      const active = await this.optimizationRepository.findActiveByRouteId(
        context.tenantId,
        routeId,
      );
      if (active) {
        active.aggregate.cancel();
        await this.optimizationRepository.save(context.tenantId, active);
        eventsFrom.push(active.aggregate);
      }

      const optimization = Optimization.queue({ routeId });
      await this.optimizationRepository.add(context.tenantId, optimization);
      eventsFrom.push(optimization);

      return { result: undefined, eventsFrom };
    });
  }
}