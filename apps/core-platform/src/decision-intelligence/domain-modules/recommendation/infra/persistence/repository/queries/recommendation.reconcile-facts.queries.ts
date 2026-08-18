/** Types generated for queries found in "src/decision-intelligence/domain-modules/recommendation/infra/persistence/repository/queries/recommendation.reconcile-facts.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type numberArray = (number)[];

export type stringArray = (string)[];

/** 'ReconcileRecommendationFacts' parameters type */
export interface IReconcileRecommendationFactsParams {
  baselineValues: numberArray;
  ids: stringArray;
  improvements: numberArray;
  metrics: stringArray;
  recommendationIds: stringArray;
  recommendedValues: numberArray;
  tenantId: string;
  units: stringArray;
}

/** 'ReconcileRecommendationFacts' return type */
export interface IReconcileRecommendationFactsResult {
  deletedCount: number;
  upsertedCount: number;
}

/** 'ReconcileRecommendationFacts' query type */
export interface IReconcileRecommendationFactsQuery {
  params: IReconcileRecommendationFactsParams;
  result: IReconcileRecommendationFactsResult;
}

const reconcileRecommendationFactsIR: any = {"usedParamSet":{"recommendationIds":true,"ids":true,"metrics":true,"baselineValues":true,"recommendedValues":true,"units":true,"improvements":true,"tenantId":true},"params":[{"name":"recommendationIds","required":true,"transform":{"type":"scalar"},"locs":[{"a":49,"b":67},{"a":1543,"b":1561}]},{"name":"ids","required":true,"transform":{"type":"scalar"},"locs":[{"a":82,"b":86},{"a":1598,"b":1602}]},{"name":"metrics","required":true,"transform":{"type":"scalar"},"locs":[{"a":101,"b":109}]},{"name":"baselineValues","required":true,"transform":{"type":"scalar"},"locs":[{"a":124,"b":139}]},{"name":"recommendedValues","required":true,"transform":{"type":"scalar"},"locs":[{"a":156,"b":174}]},{"name":"units","required":true,"transform":{"type":"scalar"},"locs":[{"a":191,"b":197}]},{"name":"improvements","required":true,"transform":{"type":"scalar"},"locs":[{"a":212,"b":225}]},{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":599,"b":608},{"a":1492,"b":1501}]}],"statement":"WITH incoming AS (\n  SELECT *\n  FROM unnest(\n    :recommendationIds!::uuid[],\n    :ids!::uuid[],\n    :metrics!::text[],\n    :baselineValues!::float8[],\n    :recommendedValues!::float8[],\n    :units!::text[],\n    :improvements!::float8[]\n  ) AS values(\n    recommendation_id,\n    id,\n    metric,\n    baseline_value,\n    recommended_value,\n    unit,\n    improvement\n  )\n),\nupserted AS (\n  INSERT INTO decision_intelligence.recommendation_facts AS current (\n    tenant_id,\n    recommendation_id,\n    id,\n    metric,\n    baseline_value,\n    recommended_value,\n    unit,\n    improvement\n  )\n  SELECT\n    :tenantId!,\n    incoming.recommendation_id,\n    incoming.id,\n    incoming.metric,\n    incoming.baseline_value,\n    incoming.recommended_value,\n    incoming.unit,\n    incoming.improvement\n  FROM incoming\n  ON CONFLICT (tenant_id, recommendation_id, id)\n  DO UPDATE SET\n    metric = EXCLUDED.metric,\n    baseline_value = EXCLUDED.baseline_value,\n    recommended_value = EXCLUDED.recommended_value,\n    unit = EXCLUDED.unit,\n    improvement = EXCLUDED.improvement,\n    updated_at = now()\n  WHERE (\n    current.metric,\n    current.baseline_value,\n    current.recommended_value,\n    current.unit,\n    current.improvement\n  ) IS DISTINCT FROM (\n    EXCLUDED.metric,\n    EXCLUDED.baseline_value,\n    EXCLUDED.recommended_value,\n    EXCLUDED.unit,\n    EXCLUDED.improvement\n  )\n  RETURNING id\n),\ndeleted AS (\n  DELETE FROM decision_intelligence.recommendation_facts current\n  WHERE current.tenant_id = :tenantId!\n    AND current.recommendation_id = ANY(:recommendationIds!::uuid[])\n    AND current.id <> ALL(:ids!::uuid[])\n  RETURNING id\n)\nSELECT\n  (SELECT count(*)::integer FROM upserted) AS \"upsertedCount!\",\n  (SELECT count(*)::integer FROM deleted) AS \"deletedCount!\""};

/**
 * Query generated from SQL:
 * ```
 * WITH incoming AS (
 *   SELECT *
 *   FROM unnest(
 *     :recommendationIds!::uuid[],
 *     :ids!::uuid[],
 *     :metrics!::text[],
 *     :baselineValues!::float8[],
 *     :recommendedValues!::float8[],
 *     :units!::text[],
 *     :improvements!::float8[]
 *   ) AS values(
 *     recommendation_id,
 *     id,
 *     metric,
 *     baseline_value,
 *     recommended_value,
 *     unit,
 *     improvement
 *   )
 * ),
 * upserted AS (
 *   INSERT INTO decision_intelligence.recommendation_facts AS current (
 *     tenant_id,
 *     recommendation_id,
 *     id,
 *     metric,
 *     baseline_value,
 *     recommended_value,
 *     unit,
 *     improvement
 *   )
 *   SELECT
 *     :tenantId!,
 *     incoming.recommendation_id,
 *     incoming.id,
 *     incoming.metric,
 *     incoming.baseline_value,
 *     incoming.recommended_value,
 *     incoming.unit,
 *     incoming.improvement
 *   FROM incoming
 *   ON CONFLICT (tenant_id, recommendation_id, id)
 *   DO UPDATE SET
 *     metric = EXCLUDED.metric,
 *     baseline_value = EXCLUDED.baseline_value,
 *     recommended_value = EXCLUDED.recommended_value,
 *     unit = EXCLUDED.unit,
 *     improvement = EXCLUDED.improvement,
 *     updated_at = now()
 *   WHERE (
 *     current.metric,
 *     current.baseline_value,
 *     current.recommended_value,
 *     current.unit,
 *     current.improvement
 *   ) IS DISTINCT FROM (
 *     EXCLUDED.metric,
 *     EXCLUDED.baseline_value,
 *     EXCLUDED.recommended_value,
 *     EXCLUDED.unit,
 *     EXCLUDED.improvement
 *   )
 *   RETURNING id
 * ),
 * deleted AS (
 *   DELETE FROM decision_intelligence.recommendation_facts current
 *   WHERE current.tenant_id = :tenantId!
 *     AND current.recommendation_id = ANY(:recommendationIds!::uuid[])
 *     AND current.id <> ALL(:ids!::uuid[])
 *   RETURNING id
 * )
 * SELECT
 *   (SELECT count(*)::integer FROM upserted) AS "upsertedCount!",
 *   (SELECT count(*)::integer FROM deleted) AS "deletedCount!"
 * ```
 */
export const reconcileRecommendationFacts = new PreparedQuery<IReconcileRecommendationFactsParams,IReconcileRecommendationFactsResult>(reconcileRecommendationFactsIR);


