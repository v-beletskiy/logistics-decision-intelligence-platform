import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

import { UseCaseContext } from "../../../../../../../shared/modules/access-control/app/execution/use-case-context";
import { SYSTEM_PRINCIPALS } from "../../../../../../../shared/modules/access-control/app/identity/system-principals";
import {
  routeInputChanged,
  type RouteInputChangedApplicationEvent,
} from "../../../../../../operational-workspace/public-api/events/route-input-changed.application-event";
import { QueueOptimizationCommand } from "../../commands/queue-optimization/queue-optimization.command";
import { QueueOptimizationHandler } from "../../commands/queue-optimization/queue-optimization.handler";

@Injectable()
export class RouteInputChangedHandler {
  constructor(
    private readonly queueOptimizationHandler: QueueOptimizationHandler,
  ) {}

  @OnEvent(routeInputChanged.type)
  async exec(event: RouteInputChangedApplicationEvent): Promise<void> {
    await this.queueOptimizationHandler.exec({
      context: UseCaseContext.fromIdentity({
        ...SYSTEM_PRINCIPALS.decisionIntelligenceOptimization,
        tenantId: event.payload.tenantId,
      }),
      input: new QueueOptimizationCommand(event.payload.routeId),
    });
  }
}
