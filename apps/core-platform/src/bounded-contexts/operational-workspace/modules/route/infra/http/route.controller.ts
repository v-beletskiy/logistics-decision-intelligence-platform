import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from "@nestjs/common";

import { CurrentUseCaseContext } from "../../../../../../shared/modules/access-control/infra/authentication/current-use-case-context.decorator.js";
import type { UseCaseContext } from "../../../../../../shared/modules/access-control/app/execution/use-case-context.js";
import { CancelRouteCommand } from "../../app/commands/cancel-route/cancel-route.command.js";
import { CancelRouteHandler } from "../../app/commands/cancel-route/cancel-route.handler.js";
import { CompleteRouteCommand } from "../../app/commands/complete-route/complete-route.command.js";
import { CompleteRouteHandler } from "../../app/commands/complete-route/complete-route.handler.js";
import { CreateRouteCommand } from "../../app/commands/create-route/create-route.command.js";
import { CreateRouteHandler } from "../../app/commands/create-route/create-route.handler.js";
import { RecordRouteStopArrivalCommand } from "../../app/commands/record-route-stop-arrival/record-route-stop-arrival.command.js";
import { RecordRouteStopArrivalHandler } from "../../app/commands/record-route-stop-arrival/record-route-stop-arrival.handler.js";
import { RecordRouteStopDepartureCommand } from "../../app/commands/record-route-stop-departure/record-route-stop-departure.command.js";
import { RecordRouteStopDepartureHandler } from "../../app/commands/record-route-stop-departure/record-route-stop-departure.handler.js";
import { StartRouteCommand } from "../../app/commands/start-route/start-route.command.js";
import { StartRouteHandler } from "../../app/commands/start-route/start-route.handler.js";
import { StartRouteStopCommand } from "../../app/commands/start-route-stop/start-route-stop.command.js";
import { StartRouteStopHandler } from "../../app/commands/start-route-stop/start-route-stop.handler.js";
import type {
  CreateRouteRequest,
  CreatedRouteResponse,
  RecordRouteStopArrivalRequest,
  RecordRouteStopDepartureRequest,
  RouteRouteParams,
  RouteStopRouteParams,
} from "./route.http-contracts.js";
import { RouteHttpMapper } from "./route.http-mapper.js";
import {
  createRouteRequestPipe,
  recordRouteStopArrivalRequestPipe,
  recordRouteStopDepartureRequestPipe,
  routeRouteParamsPipe,
  routeStopRouteParamsPipe,
} from "./schemas/index.js";

@Controller({ path: "routes", version: "1" })
export class RouteController {
  constructor(
    private readonly createRouteHandler: CreateRouteHandler,
    private readonly startRouteHandler: StartRouteHandler,
    private readonly startRouteStopHandler: StartRouteStopHandler,
    private readonly recordRouteStopArrivalHandler: RecordRouteStopArrivalHandler,
    private readonly recordRouteStopDepartureHandler: RecordRouteStopDepartureHandler,
    private readonly completeRouteHandler: CompleteRouteHandler,
    private readonly cancelRouteHandler: CancelRouteHandler,
  ) {}

  @Post()
  async create(
    @CurrentUseCaseContext() executionContext: UseCaseContext,
    @Body(createRouteRequestPipe) request: CreateRouteRequest,
  ): Promise<CreatedRouteResponse> {
    const routeId = await this.createRouteHandler.exec({
      context: executionContext,
      input: new CreateRouteCommand(RouteHttpMapper.toRouteStopsInput(request)),
    });
    return RouteHttpMapper.toCreatedRouteResponse(routeId);
  }

  @Put(":routeId/start")
  @HttpCode(HttpStatus.NO_CONTENT)
  start(
    @CurrentUseCaseContext() executionContext: UseCaseContext,
    @Param(routeRouteParamsPipe) params: RouteRouteParams,
  ): Promise<void> {
    return this.startRouteHandler.exec({
      context: executionContext,
      input: new StartRouteCommand(params.routeId),
    });
  }

  @Put(":routeId/stops/:sequence/start")
  @HttpCode(HttpStatus.NO_CONTENT)
  startStop(
    @CurrentUseCaseContext() executionContext: UseCaseContext,
    @Param(routeStopRouteParamsPipe) params: RouteStopRouteParams,
  ): Promise<void> {
    return this.startRouteStopHandler.exec({
      context: executionContext,
      input: new StartRouteStopCommand(params.routeId, Number(params.sequence)),
    });
  }

  @Put(":routeId/stops/:sequence/arrival")
  @HttpCode(HttpStatus.NO_CONTENT)
  recordArrival(
    @CurrentUseCaseContext() executionContext: UseCaseContext,
    @Param(routeStopRouteParamsPipe) params: RouteStopRouteParams,
    @Body(recordRouteStopArrivalRequestPipe)
    request: RecordRouteStopArrivalRequest,
  ): Promise<void> {
    return this.recordRouteStopArrivalHandler.exec({
      context: executionContext,
      input: new RecordRouteStopArrivalCommand(
        params.routeId,
        Number(params.sequence),
        new Date(request.arrivedAt),
      ),
    });
  }

  @Put(":routeId/stops/:sequence/departure")
  @HttpCode(HttpStatus.NO_CONTENT)
  recordDeparture(
    @CurrentUseCaseContext() executionContext: UseCaseContext,
    @Param(routeStopRouteParamsPipe) params: RouteStopRouteParams,
    @Body(recordRouteStopDepartureRequestPipe)
    request: RecordRouteStopDepartureRequest,
  ): Promise<void> {
    return this.recordRouteStopDepartureHandler.exec({
      context: executionContext,
      input: new RecordRouteStopDepartureCommand(
        params.routeId,
        Number(params.sequence),
        new Date(request.departedAt),
      ),
    });
  }

  @Put(":routeId/completion")
  @HttpCode(HttpStatus.NO_CONTENT)
  complete(
    @CurrentUseCaseContext() executionContext: UseCaseContext,
    @Param(routeRouteParamsPipe) params: RouteRouteParams,
  ): Promise<void> {
    return this.completeRouteHandler.exec({
      context: executionContext,
      input: new CompleteRouteCommand(params.routeId),
    });
  }

  @Put(":routeId/cancellation")
  @HttpCode(HttpStatus.NO_CONTENT)
  cancel(
    @CurrentUseCaseContext() executionContext: UseCaseContext,
    @Param(routeRouteParamsPipe) params: RouteRouteParams,
  ): Promise<void> {
    return this.cancelRouteHandler.exec({
      context: executionContext,
      input: new CancelRouteCommand(params.routeId),
    });
  }
}
