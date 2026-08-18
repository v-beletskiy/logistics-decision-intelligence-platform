/** Types generated for queries found in "src/decision-intelligence/domain-modules/recommendation/infra/persistence/repository/queries/recommendation.save-many.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type numberArray = (number)[];

export type stringArray = (string)[];

/** 'SaveRecommendations' parameters type */
export interface ISaveRecommendationsParams {
  confidences: numberArray;
  ids: stringArray;
  optimizationIds: stringArray;
  routeIds: stringArray;
  scores: numberArray;
  statuses: stringArray;
  summaries: stringArray;
  tenantId: string;
  types: stringArray;
}

/** 'SaveRecommendations' return type */
export type ISaveRecommendationsResult = void;

/** 'SaveRecommendations' query type */
export interface ISaveRecommendationsQuery {
  params: ISaveRecommendationsParams;
  result: ISaveRecommendationsResult;
}

const saveRecommendationsIR: any = {"usedParamSet":{"ids":true,"routeIds":true,"optimizationIds":true,"types":true,"statuses":true,"summaries":true,"confidences":true,"scores":true,"tenantId":true},"params":[{"name":"ids","required":true,"transform":{"type":"scalar"},"locs":[{"a":49,"b":53}]},{"name":"routeIds","required":true,"transform":{"type":"scalar"},"locs":[{"a":68,"b":77}]},{"name":"optimizationIds","required":true,"transform":{"type":"scalar"},"locs":[{"a":92,"b":108}]},{"name":"types","required":true,"transform":{"type":"scalar"},"locs":[{"a":123,"b":129}]},{"name":"statuses","required":true,"transform":{"type":"scalar"},"locs":[{"a":144,"b":153}]},{"name":"summaries","required":true,"transform":{"type":"scalar"},"locs":[{"a":168,"b":178}]},{"name":"confidences","required":true,"transform":{"type":"scalar"},"locs":[{"a":193,"b":205}]},{"name":"scores","required":true,"transform":{"type":"scalar"},"locs":[{"a":222,"b":229}]},{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":517,"b":526}]}],"statement":"WITH incoming AS (\n  SELECT *\n  FROM unnest(\n    :ids!::uuid[],\n    :routeIds!::uuid[],\n    :optimizationIds!::uuid[],\n    :types!::text[],\n    :statuses!::text[],\n    :summaries!::text[],\n    :confidences!::float8[],\n    :scores!::float8[]\n  ) AS values(id, route_id, optimization_id, type, status, summary, confidence, score)\n)\nINSERT INTO decision_intelligence.recommendations AS current (\n  tenant_id,\n  id,\n  route_id,\n  optimization_id,\n  type,\n  status,\n  summary,\n  confidence,\n  score,\n  revision\n)\nSELECT\n  :tenantId!,\n  incoming.id,\n  incoming.route_id,\n  incoming.optimization_id,\n  incoming.type,\n  incoming.status,\n  incoming.summary,\n  incoming.confidence,\n  incoming.score,\n  1\nFROM incoming\nON CONFLICT (tenant_id, id)\nDO UPDATE SET\n  route_id = EXCLUDED.route_id,\n  optimization_id = EXCLUDED.optimization_id,\n  type = EXCLUDED.type,\n  status = EXCLUDED.status,\n  summary = EXCLUDED.summary,\n  confidence = EXCLUDED.confidence,\n  score = EXCLUDED.score,\n  revision = current.revision + 1,\n  updated_at = now()"};

/**
 * Query generated from SQL:
 * ```
 * WITH incoming AS (
 *   SELECT *
 *   FROM unnest(
 *     :ids!::uuid[],
 *     :routeIds!::uuid[],
 *     :optimizationIds!::uuid[],
 *     :types!::text[],
 *     :statuses!::text[],
 *     :summaries!::text[],
 *     :confidences!::float8[],
 *     :scores!::float8[]
 *   ) AS values(id, route_id, optimization_id, type, status, summary, confidence, score)
 * )
 * INSERT INTO decision_intelligence.recommendations AS current (
 *   tenant_id,
 *   id,
 *   route_id,
 *   optimization_id,
 *   type,
 *   status,
 *   summary,
 *   confidence,
 *   score,
 *   revision
 * )
 * SELECT
 *   :tenantId!,
 *   incoming.id,
 *   incoming.route_id,
 *   incoming.optimization_id,
 *   incoming.type,
 *   incoming.status,
 *   incoming.summary,
 *   incoming.confidence,
 *   incoming.score,
 *   1
 * FROM incoming
 * ON CONFLICT (tenant_id, id)
 * DO UPDATE SET
 *   route_id = EXCLUDED.route_id,
 *   optimization_id = EXCLUDED.optimization_id,
 *   type = EXCLUDED.type,
 *   status = EXCLUDED.status,
 *   summary = EXCLUDED.summary,
 *   confidence = EXCLUDED.confidence,
 *   score = EXCLUDED.score,
 *   revision = current.revision + 1,
 *   updated_at = now()
 * ```
 */
export const saveRecommendations = new PreparedQuery<ISaveRecommendationsParams,ISaveRecommendationsResult>(saveRecommendationsIR);


