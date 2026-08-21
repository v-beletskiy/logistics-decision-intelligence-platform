import { Inject, Injectable } from "@nestjs/common";

import {
  APP_CONFIG,
  type AppConfig,
} from "../../../../shared/infra/config/app-config";
import type {
  RouteOptimizer,
  RouteOptimizationProblem,
} from "../../../app/optimization/ports/route-optimizer.port";
import type { RouteOptimizationSolution } from "../../../app/optimization/models/route-optimization-solution";
import { VroomClient } from "./vroom-client";
import { VroomMapper } from "./vroom.mapper";

/** Solves route problems through the VROOM engine. */
@Injectable()
export class VroomRouteOptimizer implements RouteOptimizer {
  constructor(
    private readonly vroomClient: VroomClient,
    private readonly mapper: VroomMapper,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  async optimize(
    problem: RouteOptimizationProblem,
  ): Promise<RouteOptimizationSolution> {
    const request = this.mapper.toRequest(problem.stops);
    const response = await this.vroomClient.optimize(
      this.config.optimization.vroomUrl,
      request,
    );
    return this.mapper.toSolution(response, problem.matrix);
  }
}
