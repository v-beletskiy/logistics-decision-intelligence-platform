import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from "@nestjs/common";

import { CurrentExecutionContext } from "../../../../shared/access-control/authentication/current-execution-context.decorator";
import type { ExecutionContext } from "../../../../shared/app/execution/execution-context";
import { CancelRouteCommand } from "../../../app/route/commands/cancel-route/cancel-route.command";
import { CancelRouteHandler } from "../../../app/route/commands/cancel-route/cancel-route.handler";
import { CompleteRouteCommand } from "../../../app/route/commands/complete-route/complete-route.command";
import { CompleteRouteHandler } from "../../../app/route/commands/complete-route/complete-route.handler";
import { CreateRouteCommand } from "../../../app/route/commands/create-route/create-route.command";
import { CreateRouteHandler } from "../../../app/route/commands/create-route/create-route.handler";
import { RecordRouteStopArrivalCommand } from "../../../app/route/commands/record-route-stop-arrival/record-route-stop-arrival.command";
import { RecordRouteStopArrivalHandler } from "../../../app/route/commands/record-route-stop-arrival/record-route-stop-arrival.handler";
import { RecordRouteStopDepartureCommand } from "../../../app/route/commands/record-route-stop-departure/record-route-stop-departure.command";
import { RecordRouteStopDepartureHandler } from "../../../app/route/commands/record-route-stop-departure/record-route-stop-departure.handler";
import { StartRouteCommand } from "../../../app/route/commands/start-route/start-route.command";
import { StartRouteHandler } from "../../../app/route/commands/start-route/start-route.handler";
import { StartRouteStopCommand } from "../../../app/route/commands/start-route-stop/start-route-stop.command";
import { StartRouteStopHandler } from "../../../app/route/commands/start-route-stop/start-route-stop.handler";
import type {
  CreateRouteRequest,
  CreatedRouteResponse,
  RecordRouteStopArrivalRequest,
  RecordRouteStopDepartureRequest,
  RouteRouteParams,
  RouteStopRouteParams,
} from "./route.http-contracts";
import { RouteHttpMapper } from "./route.http-mapper";
import {
  createRouteRequestPipe,
  recordRouteStopArrivalRequestPipe,
  recordRouteStopDepartureRequestPipe,
  routeRouteParamsPipe,
  routeStopRouteParamsPipe,
} from "./schemas";

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
    @CurrentExecutionContext() executionContext: ExecutionContext,
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
    @CurrentExecutionContext() executionContext: ExecutionContext,
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
    @CurrentExecutionContext() executionContext: ExecutionContext,
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
    @CurrentExecutionContext() executionContext: ExecutionContext,
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
    @CurrentExecutionContext() executionContext: ExecutionContext,
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
    @CurrentExecutionContext() executionContext: ExecutionContext,
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
    @CurrentExecutionContext() executionContext: ExecutionContext,
    @Param(routeRouteParamsPipe) params: RouteRouteParams,
  ): Promise<void> {
    return this.cancelRouteHandler.exec({
      context: executionContext,
      input: new CancelRouteCommand(params.routeId),
    });
  }
}
