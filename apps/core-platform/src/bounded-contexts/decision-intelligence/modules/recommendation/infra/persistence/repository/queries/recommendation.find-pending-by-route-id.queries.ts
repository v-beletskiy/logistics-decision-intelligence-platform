/** Types generated for queries found in "src/bounded-contexts/decision-intelligence/modules/recommendation/infra/persistence/repository/queries/recommendation.find-pending-by-route-id.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'FindRecommendationsPendingByRouteId' parameters type */
export interface IFindRecommendationsPendingByRouteIdParams {
  routeId: string;
  tenantId: string;
}

/** 'FindRecommendationsPendingByRouteId' return type */
export interface IFindRecommendationsPendingByRouteIdResult {
  confidence: number | null;
  facts: Json | null;
  findings: Json | null;
  id: string;
  optimization_id: string;
  proposed_route_stop_ids: Json | null;
  revision: string;
  route_id: string;
  score: number;
  status: string;
  summary: string | null;
  type: string;
}

/** 'FindRecommendationsPendingByRouteId' query type */
export interface IFindRecommendationsPendingByRouteIdQuery {
  params: IFindRecommendationsPendingByRouteIdParams;
  result: IFindRecommendationsPendingByRouteIdResult;
}

const findRecommendationsPendingByRouteIdIR: any = {"usedParamSet":{"tenantId":true,"routeId":true},"params":[{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":1388,"b":1397}]},{"name":"routeId","required":true,"transform":{"type":"scalar"},"locs":[{"a":1418,"b":1426}]}],"statement":"SELECT\n  r.id,\n  r.route_id,\n  r.optimization_id,\n  r.type,\n  r.status,\n  r.summary,\n  r.confidence,\n  r.score,\n  r.revision,\n  COALESCE(facts.items, '[]'::jsonb) AS facts,\n  COALESCE(findings.items, '[]'::jsonb) AS findings,\n  COALESCE(route_plan_stops.items, '[]'::jsonb) AS proposed_route_stop_ids\nFROM decision_intelligence.recommendations r\nLEFT JOIN LATERAL (\n  SELECT jsonb_agg(\n    jsonb_build_object(\n      'id', f.id,\n      'metric', f.metric,\n      'baselineValue', f.baseline_value,\n      'recommendedValue', f.recommended_value,\n      'unit', f.unit,\n      'improvement', f.improvement\n    )\n    ORDER BY f.id\n  ) AS items\n  FROM decision_intelligence.recommendation_facts f\n  WHERE f.tenant_id = r.tenant_id\n    AND f.recommendation_id = r.id\n) facts ON true\nLEFT JOIN LATERAL (\n  SELECT jsonb_agg(\n    jsonb_build_object(\n      'id', g.id,\n      'category', g.category,\n      'title', g.title,\n      'description', g.description\n    )\n    ORDER BY g.id\n  ) AS items\n  FROM decision_intelligence.recommendation_findings g\n  WHERE g.tenant_id = r.tenant_id\n    AND g.recommendation_id = r.id\n) findings ON true\nLEFT JOIN LATERAL (\n  SELECT jsonb_agg(p.route_stop_id ORDER BY p.sequence) AS items\n  FROM decision_intelligence.recommendation_route_plan_stops p\n  WHERE p.tenant_id = r.tenant_id\n    AND p.recommendation_id = r.id\n) route_plan_stops ON true\nWHERE r.tenant_id = :tenantId!\n  AND r.route_id = :routeId!\n  AND r.status = 'PENDING'\nORDER BY r.id"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   r.id,
 *   r.route_id,
 *   r.optimization_id,
 *   r.type,
 *   r.status,
 *   r.summary,
 *   r.confidence,
 *   r.score,
 *   r.revision,
 *   COALESCE(facts.items, '[]'::jsonb) AS facts,
 *   COALESCE(findings.items, '[]'::jsonb) AS findings,
 *   COALESCE(route_plan_stops.items, '[]'::jsonb) AS proposed_route_stop_ids
 * FROM decision_intelligence.recommendations r
 * LEFT JOIN LATERAL (
 *   SELECT jsonb_agg(
 *     jsonb_build_object(
 *       'id', f.id,
 *       'metric', f.metric,
 *       'baselineValue', f.baseline_value,
 *       'recommendedValue', f.recommended_value,
 *       'unit', f.unit,
 *       'improvement', f.improvement
 *     )
 *     ORDER BY f.id
 *   ) AS items
 *   FROM decision_intelligence.recommendation_facts f
 *   WHERE f.tenant_id = r.tenant_id
 *     AND f.recommendation_id = r.id
 * ) facts ON true
 * LEFT JOIN LATERAL (
 *   SELECT jsonb_agg(
 *     jsonb_build_object(
 *       'id', g.id,
 *       'category', g.category,
 *       'title', g.title,
 *       'description', g.description
 *     )
 *     ORDER BY g.id
 *   ) AS items
 *   FROM decision_intelligence.recommendation_findings g
 *   WHERE g.tenant_id = r.tenant_id
 *     AND g.recommendation_id = r.id
 * ) findings ON true
 * LEFT JOIN LATERAL (
 *   SELECT jsonb_agg(p.route_stop_id ORDER BY p.sequence) AS items
 *   FROM decision_intelligence.recommendation_route_plan_stops p
 *   WHERE p.tenant_id = r.tenant_id
 *     AND p.recommendation_id = r.id
 * ) route_plan_stops ON true
 * WHERE r.tenant_id = :tenantId!
 *   AND r.route_id = :routeId!
 *   AND r.status = 'PENDING'
 * ORDER BY r.id
 * ```
 */
export const findRecommendationsPendingByRouteId = new PreparedQuery<IFindRecommendationsPendingByRouteIdParams,IFindRecommendationsPendingByRouteIdResult>(findRecommendationsPendingByRouteIdIR);
