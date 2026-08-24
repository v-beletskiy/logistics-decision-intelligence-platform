import type { FromSchema } from "json-schema-to-ts";

import type { RecommendationListItem } from "../../app/ports/recommendation-read-store.js";
import type { listRecommendationsRequestSchema } from "./schemas/index.js";

export type ListRecommendationsRequest = FromSchema<
  typeof listRecommendationsRequestSchema
>;

export interface ListRecommendationsResponse {
  readonly items: readonly RecommendationListItem[];
}
