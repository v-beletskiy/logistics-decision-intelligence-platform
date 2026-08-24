import { Inject, Injectable } from "@nestjs/common";

import {
  APP_CONFIG,
  type WorkerAppConfig,
} from "../../../../../../shared/infra/config/app-config.js";
import type {
  RouteOptimizer,
  RouteOptimizationProblem,
  RouteOptimizationSolution,
} from "../../app/ports/route-optimizer.js";
import { VroomClient } from "./vroom-client.js";
import { VroomMapper } from "./vroom.mapper.js";

/** Solves route problems through the VROOM engine. */
@Injectable()
export class VroomRouteOptimizer implements RouteOptimizer {
  constructor(
    private readonly vroomClient: VroomClient,
    private readonly vroomMapper: VroomMapper,
    @Inject(APP_CONFIG) private readonly config: WorkerAppConfig,
  ) {}

  async optimize(
    problem: RouteOptimizationProblem,
  ): Promise<RouteOptimizationSolution> {
    const request = this.vroomMapper.toRequest(problem);
    const response = await this.vroomClient.optimize(
      this.config.optimization.vroomBaseUrl,
      request,
    );
    return this.vroomMapper.toSolution(response, problem.matrix);
  }
}
