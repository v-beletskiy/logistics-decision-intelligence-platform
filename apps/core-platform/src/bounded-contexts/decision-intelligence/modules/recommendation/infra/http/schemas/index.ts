import { SchemaRegistry } from "@logistics-decision-intelligence/validation/json-schema";

import { JsonSchemaPipe } from "../../../../../../../shared/infra/http/json-schema.pipe.js";
import { listRecommendationsRequestSchema } from "./list-recommendations-request.schema.js";

export { listRecommendationsRequestSchema };

const recommendationSchemas = new SchemaRegistry([
  listRecommendationsRequestSchema,
]);

export const listRecommendationsRequestPipe = new JsonSchemaPipe(
  recommendationSchemas,
  listRecommendationsRequestSchema,
);
