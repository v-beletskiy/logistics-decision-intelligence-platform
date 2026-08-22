/* @name ReconcileRecommendationFindings */
WITH incoming AS (
  SELECT *
  FROM unnest(
    :recommendationIds!::uuid[],
    :ids!::uuid[],
    :categories!::text[],
    :titles!::text[],
    :descriptions!::text[]
  ) AS values(
    recommendation_id,
    id,
    category,
    title,
    description
  )
),
upserted AS (
  INSERT INTO decision_intelligence.recommendation_findings AS current (
    tenant_id,
    recommendation_id,
    id,
    category,
    title,
    description
  )
  SELECT
    :tenantId!,
    incoming.recommendation_id,
    incoming.id,
    incoming.category,
    incoming.title,
    incoming.description
  FROM incoming
  ON CONFLICT (tenant_id, recommendation_id, id)
  DO UPDATE SET
    category = EXCLUDED.category,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    updated_at = now()
  WHERE (
    current.category,
    current.title,
    current.description
  ) IS DISTINCT FROM (
    EXCLUDED.category,
    EXCLUDED.title,
    EXCLUDED.description
  )
  RETURNING id
),
deleted AS (
  DELETE FROM decision_intelligence.recommendation_findings current
  WHERE current.tenant_id = :tenantId!
    AND current.recommendation_id = ANY(:recommendationIds!::uuid[])
    AND current.id <> ALL(:ids!::uuid[])
  RETURNING id
)
SELECT
  (SELECT count(*)::integer FROM upserted) AS "upsertedCount!",
  (SELECT count(*)::integer FROM deleted) AS "deletedCount!";