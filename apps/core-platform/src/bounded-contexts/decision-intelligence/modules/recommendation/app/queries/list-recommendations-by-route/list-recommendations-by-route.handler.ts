import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../../../shared/modules/access-control/app/authorization/authorized.decorator.js";
import type { UseCaseRequest } from "../../../../../../../shared/modules/access-control/app/execution/use-case-context.js";
import { Permission } from "../../../../../../../shared/modules/access-control/app/permissions/permission.enum.js";
import {
  RecommendationReadStore,
  type RecommendationListItem,
} from "../../ports/recommendation-read-store.js";
import { ListRecommendationsByRouteQuery } from "./list-recommendations-by-route.query.js";

@Injectable()
export class ListRecommendationsByRouteHandler {
  constructor(
    private readonly recommendationReadStore: RecommendationReadStore,
  ) {}

  @Authorized(Permission.RouteRead)
  exec(
    request: UseCaseRequest<ListRecommendationsByRouteQuery>,
  ): Promise<readonly RecommendationListItem[]> {
    return this.recommendationReadStore.listByRouteId(
      request.context.tenantId,
      request.input.routeId,
    );
  }
}
