/* @name ReconcileRecommendationFacts */
WITH incoming AS (
  SELECT *
  FROM unnest(
    :recommendationIds!::uuid[],
    :ids!::uuid[],
    :metrics!::text[],
    :baselineValues!::float8[],
    :recommendedValues!::float8[],
    :units!::text[],
    :improvements!::float8[]
  ) AS values(
    recommendation_id,
    id,
    metric,
    baseline_value,
    recommended_value,
    unit,
    improvement
  )
),
upserted AS (
  INSERT INTO decision_intelligence.recommendation_facts AS current (
    tenant_id,
    recommendation_id,
    id,
    metric,
    baseline_value,
    recommended_value,
    unit,
    improvement
  )
  SELECT
    :tenantId!,
    incoming.recommendation_id,
    incoming.id,
    incoming.metric,
    incoming.baseline_value,
    incoming.recommended_value,
    incoming.unit,
    incoming.improvement
  FROM incoming
  ON CONFLICT (tenant_id, recommendation_id, id)
  DO UPDATE SET
    metric = EXCLUDED.metric,
    baseline_value = EXCLUDED.baseline_value,
    recommended_value = EXCLUDED.recommended_value,
    unit = EXCLUDED.unit,
    improvement = EXCLUDED.improvement,
    updated_at = now()
  WHERE (
    current.metric,
    current.baseline_value,
    current.recommended_value,
    current.unit,
    current.improvement
  ) IS DISTINCT FROM (
    EXCLUDED.metric,
    EXCLUDED.baseline_value,
    EXCLUDED.recommended_value,
    EXCLUDED.unit,
    EXCLUDED.improvement
  )
  RETURNING id
),
deleted AS (
  DELETE FROM decision_intelligence.recommendation_facts current
  WHERE current.tenant_id = :tenantId!
    AND current.recommendation_id = ANY(:recommendationIds!::uuid[])
    AND current.id <> ALL(:ids!::uuid[])
  RETURNING id
)
SELECT
  (SELECT count(*)::integer FROM upserted) AS "upsertedCount!",
  (SELECT count(*)::integer FROM deleted) AS "deletedCount!";