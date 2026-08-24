/** Types generated for queries found in "src/bounded-contexts/decision-intelligence/modules/recommendation/infra/persistence/repository/queries/recommendation.reconcile-findings.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type stringArray = (string)[];

/** 'ReconcileRecommendationFindings' parameters type */
export interface IReconcileRecommendationFindingsParams {
  categories: stringArray;
  descriptions: stringArray;
  ids: stringArray;
  recommendationIds: stringArray;
  tenantId: string;
  titles: stringArray;
}

/** 'ReconcileRecommendationFindings' return type */
export interface IReconcileRecommendationFindingsResult {
  deletedCount: number;
  upsertedCount: number;
}

/** 'ReconcileRecommendationFindings' query type */
export interface IReconcileRecommendationFindingsQuery {
  params: IReconcileRecommendationFindingsParams;
  result: IReconcileRecommendationFindingsResult;
}

const reconcileRecommendationFindingsIR: any = {"usedParamSet":{"recommendationIds":true,"ids":true,"categories":true,"titles":true,"descriptions":true,"tenantId":true},"params":[{"name":"recommendationIds","required":true,"transform":{"type":"scalar"},"locs":[{"a":49,"b":67},{"a":1140,"b":1158}]},{"name":"ids","required":true,"transform":{"type":"scalar"},"locs":[{"a":82,"b":86},{"a":1195,"b":1199}]},{"name":"categories","required":true,"transform":{"type":"scalar"},"locs":[{"a":101,"b":112}]},{"name":"titles","required":true,"transform":{"type":"scalar"},"locs":[{"a":127,"b":134}]},{"name":"descriptions","required":true,"transform":{"type":"scalar"},"locs":[{"a":149,"b":162}]},{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":457,"b":466},{"a":1089,"b":1098}]}],"statement":"WITH incoming AS (\n  SELECT *\n  FROM unnest(\n    :recommendationIds!::uuid[],\n    :ids!::uuid[],\n    :categories!::text[],\n    :titles!::text[],\n    :descriptions!::text[]\n  ) AS values(\n    recommendation_id,\n    id,\n    category,\n    title,\n    description\n  )\n),\nupserted AS (\n  INSERT INTO decision_intelligence.recommendation_findings AS current (\n    tenant_id,\n    recommendation_id,\n    id,\n    category,\n    title,\n    description\n  )\n  SELECT\n    :tenantId!,\n    incoming.recommendation_id,\n    incoming.id,\n    incoming.category,\n    incoming.title,\n    incoming.description\n  FROM incoming\n  ON CONFLICT (tenant_id, recommendation_id, id)\n  DO UPDATE SET\n    category = EXCLUDED.category,\n    title = EXCLUDED.title,\n    description = EXCLUDED.description,\n    updated_at = now()\n  WHERE (\n    current.category,\n    current.title,\n    current.description\n  ) IS DISTINCT FROM (\n    EXCLUDED.category,\n    EXCLUDED.title,\n    EXCLUDED.description\n  )\n  RETURNING id\n),\ndeleted AS (\n  DELETE FROM decision_intelligence.recommendation_findings current\n  WHERE current.tenant_id = :tenantId!\n    AND current.recommendation_id = ANY(:recommendationIds!::uuid[])\n    AND current.id <> ALL(:ids!::uuid[])\n  RETURNING id\n)\nSELECT\n  (SELECT count(*)::integer FROM upserted) AS \"upsertedCount!\",\n  (SELECT count(*)::integer FROM deleted) AS \"deletedCount!\""};

/**
 * Query generated from SQL:
 * ```
 * WITH incoming AS (
 *   SELECT *
 *   FROM unnest(
 *     :recommendationIds!::uuid[],
 *     :ids!::uuid[],
 *     :categories!::text[],
 *     :titles!::text[],
 *     :descriptions!::text[]
 *   ) AS values(
 *     recommendation_id,
 *     id,
 *     category,
 *     title,
 *     description
 *   )
 * ),
 * upserted AS (
 *   INSERT INTO decision_intelligence.recommendation_findings AS current (
 *     tenant_id,
 *     recommendation_id,
 *     id,
 *     category,
 *     title,
 *     description
 *   )
 *   SELECT
 *     :tenantId!,
 *     incoming.recommendation_id,
 *     incoming.id,
 *     incoming.category,
 *     incoming.title,
 *     incoming.description
 *   FROM incoming
 *   ON CONFLICT (tenant_id, recommendation_id, id)
 *   DO UPDATE SET
 *     category = EXCLUDED.category,
 *     title = EXCLUDED.title,
 *     description = EXCLUDED.description,
 *     updated_at = now()
 *   WHERE (
 *     current.category,
 *     current.title,
 *     current.description
 *   ) IS DISTINCT FROM (
 *     EXCLUDED.category,
 *     EXCLUDED.title,
 *     EXCLUDED.description
 *   )
 *   RETURNING id
 * ),
 * deleted AS (
 *   DELETE FROM decision_intelligence.recommendation_findings current
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
export const reconcileRecommendationFindings = new PreparedQuery<IReconcileRecommendationFindingsParams,IReconcileRecommendationFindingsResult>(reconcileRecommendationFindingsIR);
