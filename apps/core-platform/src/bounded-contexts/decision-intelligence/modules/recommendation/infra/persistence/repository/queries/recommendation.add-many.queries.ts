/** Types generated for queries found in "src/bounded-contexts/decision-intelligence/modules/recommendation/infra/persistence/repository/queries/recommendation.add-many.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type numberArray = (number)[];

export type stringArray = (string)[];

/** 'AddRecommendations' parameters type */
export interface IAddRecommendationsParams {
  analysisRequestEventIds: stringArray;
  analysisStatuses: stringArray;
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

/** 'AddRecommendations' return type */
export type IAddRecommendationsResult = void;

/** 'AddRecommendations' query type */
export interface IAddRecommendationsQuery {
  params: IAddRecommendationsParams;
  result: IAddRecommendationsResult;
}

const addRecommendationsIR: any = {"usedParamSet":{"ids":true,"routeIds":true,"optimizationIds":true,"types":true,"statuses":true,"analysisRequestEventIds":true,"analysisStatuses":true,"summaries":true,"confidences":true,"scores":true,"tenantId":true},"params":[{"name":"ids","required":true,"transform":{"type":"scalar"},"locs":[{"a":49,"b":53}]},{"name":"routeIds","required":true,"transform":{"type":"scalar"},"locs":[{"a":68,"b":77}]},{"name":"optimizationIds","required":true,"transform":{"type":"scalar"},"locs":[{"a":92,"b":108}]},{"name":"types","required":true,"transform":{"type":"scalar"},"locs":[{"a":123,"b":129}]},{"name":"statuses","required":true,"transform":{"type":"scalar"},"locs":[{"a":144,"b":153}]},{"name":"analysisRequestEventIds","required":true,"transform":{"type":"scalar"},"locs":[{"a":168,"b":192}]},{"name":"analysisStatuses","required":true,"transform":{"type":"scalar"},"locs":[{"a":207,"b":224}]},{"name":"summaries","required":true,"transform":{"type":"scalar"},"locs":[{"a":239,"b":249}]},{"name":"confidences","required":true,"transform":{"type":"scalar"},"locs":[{"a":264,"b":276}]},{"name":"scores","required":true,"transform":{"type":"scalar"},"locs":[{"a":293,"b":300}]},{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":669,"b":678}]}],"statement":"WITH incoming AS (\n  SELECT *\n  FROM unnest(\n    :ids!::uuid[],\n    :routeIds!::uuid[],\n    :optimizationIds!::uuid[],\n    :types!::text[],\n    :statuses!::text[],\n    :analysisRequestEventIds!::uuid[],\n    :analysisStatuses!::text[],\n    :summaries!::text[],\n    :confidences!::float8[],\n    :scores!::float8[]\n  ) AS values(id, route_id, optimization_id, type, status, analysis_request_event_id, analysis_status, summary, confidence, score)\n)\nINSERT INTO decision_intelligence.recommendations (\n  tenant_id,\n  id,\n  route_id,\n  optimization_id,\n  type,\n  status,\n  analysis_request_event_id,\n  analysis_status,\n  summary,\n  confidence,\n  score,\n  revision\n)\nSELECT\n  :tenantId!,\n  incoming.id,\n  incoming.route_id,\n  incoming.optimization_id,\n  incoming.type,\n  incoming.status,\n  incoming.analysis_request_event_id,\n  incoming.analysis_status,\n  incoming.summary,\n  incoming.confidence,\n  incoming.score,\n  1\nFROM incoming"};

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
 *     :analysisRequestEventIds!::uuid[],
 *     :analysisStatuses!::text[],
 *     :summaries!::text[],
 *     :confidences!::float8[],
 *     :scores!::float8[]
 *   ) AS values(id, route_id, optimization_id, type, status, analysis_request_event_id, analysis_status, summary, confidence, score)
 * )
 * INSERT INTO decision_intelligence.recommendations (
 *   tenant_id,
 *   id,
 *   route_id,
 *   optimization_id,
 *   type,
 *   status,
 *   analysis_request_event_id,
 *   analysis_status,
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
 *   incoming.analysis_request_event_id,
 *   incoming.analysis_status,
 *   incoming.summary,
 *   incoming.confidence,
 *   incoming.score,
 *   1
 * FROM incoming
 * ```
 */
export const addRecommendations = new PreparedQuery<IAddRecommendationsParams,IAddRecommendationsResult>(addRecommendationsIR);
