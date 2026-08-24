import type { RecommendationListItem } from "../../app/ports/recommendation-read-store.js";
import type { ListRecommendationsResponse } from "./recommendation.http-contracts.js";

export class RecommendationHttpMapper {
  static toListResponse(
    recommendations: readonly RecommendationListItem[],
  ): ListRecommendationsResponse {
    return { items: recommendations };
  }
}
