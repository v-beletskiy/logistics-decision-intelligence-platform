import { Controller, Get, Query } from "@nestjs/common";

import type { UseCaseContext } from "../../../../../../shared/modules/access-control/app/execution/use-case-context.js";
import { CurrentUseCaseContext } from "../../../../../../shared/modules/access-control/infra/authentication/current-use-case-context.decorator.js";
import { ListRecommendationsByRouteHandler } from "../../app/queries/list-recommendations-by-route/list-recommendations-by-route.handler.js";
import { ListRecommendationsByRouteQuery } from "../../app/queries/list-recommendations-by-route/list-recommendations-by-route.query.js";
import type {
  ListRecommendationsRequest,
  ListRecommendationsResponse,
} from "./recommendation.http-contracts.js";
import { RecommendationHttpMapper } from "./recommendation.http-mapper.js";
import { listRecommendationsRequestPipe } from "./schemas/index.js";

@Controller({ path: "recommendations", version: "1" })
export class RecommendationController {
  constructor(
    private readonly listRecommendationsByRouteHandler: ListRecommendationsByRouteHandler,
  ) {}

  @Get()
  async list(
    @CurrentUseCaseContext() executionContext: UseCaseContext,
    @Query(listRecommendationsRequestPipe) request: ListRecommendationsRequest,
  ): Promise<ListRecommendationsResponse> {
    const recommendations = await this.listRecommendationsByRouteHandler.exec({
      context: executionContext,
      input: new ListRecommendationsByRouteQuery(request.routeId),
    });
    return RecommendationHttpMapper.toListResponse(recommendations);
  }
}
