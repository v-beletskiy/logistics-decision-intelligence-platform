import { Inject, Injectable } from "@nestjs/common";

import {
  APP_CONFIG,
  type WorkerAppConfig,
} from "../../../../../../shared/infra/config/app-config";
import type {
  RouteOptimizer,
  RouteOptimizationProblem,
  RouteOptimizationSolution,
} from "../../app/ports/route-optimizer";
import { VroomClient } from "./vroom-client";
import { VroomMapper } from "./vroom.mapper";

/** Solves route problems through the VROOM engine. */
@Injectable()
export class VroomRouteOptimizer implements RouteOptimizer {
  constructor(
    private readonly vroomClient: VroomClient,
    private readonly mapper: VroomMapper,
    @Inject(APP_CONFIG) private readonly config: WorkerAppConfig,
  ) {}

  async optimize(
    problem: RouteOptimizationProblem,
  ): Promise<RouteOptimizationSolution> {
    const request = this.mapper.toRequest(problem.fixedOrigin, problem.stops);
    const response = await this.vroomClient.optimize(
      this.config.optimization.vroomBaseUrl,
      request,
    );
    return this.mapper.toSolution(response, problem.matrix);
  }
}
