/** Types generated for queries found in "src/bounded-contexts/decision-intelligence/modules/recommendation/infra/persistence/repository/queries/recommendation.add-route-plan-stops.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type numberArray = (number)[];

export type stringArray = (string)[];

/** 'AddRecommendationRoutePlanStops' parameters type */
export interface IAddRecommendationRoutePlanStopsParams {
  recommendationIds: stringArray;
  routeStopIds: stringArray;
  sequences: numberArray;
  tenantId: string;
}

/** 'AddRecommendationRoutePlanStops' return type */
export type IAddRecommendationRoutePlanStopsResult = void;

/** 'AddRecommendationRoutePlanStops' query type */
export interface IAddRecommendationRoutePlanStopsQuery {
  params: IAddRecommendationRoutePlanStopsParams;
  result: IAddRecommendationRoutePlanStopsResult;
}

const addRecommendationRoutePlanStopsIR: any = {"usedParamSet":{"tenantId":true,"recommendationIds":true,"routeStopIds":true,"sequences":true},"params":[{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":141,"b":150}]},{"name":"recommendationIds","required":true,"transform":{"type":"scalar"},"locs":[{"a":244,"b":262}]},{"name":"routeStopIds","required":true,"transform":{"type":"scalar"},"locs":[{"a":275,"b":288}]},{"name":"sequences","required":true,"transform":{"type":"scalar"},"locs":[{"a":301,"b":311}]}],"statement":"INSERT INTO decision_intelligence.recommendation_route_plan_stops (\n  tenant_id,\n  recommendation_id,\n  route_stop_id,\n  sequence\n)\nSELECT\n  :tenantId!,\n  incoming.recommendation_id,\n  incoming.route_stop_id,\n  incoming.sequence\nFROM unnest(\n  :recommendationIds!::uuid[],\n  :routeStopIds!::uuid[],\n  :sequences!::int4[]\n) AS incoming(recommendation_id, route_stop_id, sequence)\nON CONFLICT (tenant_id, recommendation_id, route_stop_id) DO NOTHING"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO decision_intelligence.recommendation_route_plan_stops (
 *   tenant_id,
 *   recommendation_id,
 *   route_stop_id,
 *   sequence
 * )
 * SELECT
 *   :tenantId!,
 *   incoming.recommendation_id,
 *   incoming.route_stop_id,
 *   incoming.sequence
 * FROM unnest(
 *   :recommendationIds!::uuid[],
 *   :routeStopIds!::uuid[],
 *   :sequences!::int4[]
 * ) AS incoming(recommendation_id, route_stop_id, sequence)
 * ON CONFLICT (tenant_id, recommendation_id, route_stop_id) DO NOTHING
 * ```
 */
export const addRecommendationRoutePlanStops = new PreparedQuery<IAddRecommendationRoutePlanStopsParams,IAddRecommendationRoutePlanStopsResult>(addRecommendationRoutePlanStopsIR);
