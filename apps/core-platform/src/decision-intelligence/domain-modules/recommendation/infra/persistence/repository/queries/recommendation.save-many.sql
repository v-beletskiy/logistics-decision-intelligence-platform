/* @name SaveRecommendations */
WITH incoming AS (
  SELECT *
  FROM unnest(
    :ids!::uuid[],
    :routeIds!::uuid[],
    :optimizationIds!::uuid[],
    :types!::text[],
    :statuses!::text[],
    :summaries!::text[],
    :confidences!::float8[],
    :scores!::float8[]
  ) AS values(id, route_id, optimization_id, type, status, summary, confidence, score)
)
INSERT INTO decision_intelligence.recommendations AS current (
  tenant_id,
  id,
  route_id,
  optimization_id,
  type,
  status,
  summary,
  confidence,
  score,
  revision
)
SELECT
  :tenantId!,
  incoming.id,
  incoming.route_id,
  incoming.optimization_id,
  incoming.type,
  incoming.status,
  incoming.summary,
  incoming.confidence,
  incoming.score,
  1
FROM incoming
ON CONFLICT (tenant_id, id)
DO UPDATE SET
  route_id = EXCLUDED.route_id,
  optimization_id = EXCLUDED.optimization_id,
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  summary = EXCLUDED.summary,
  confidence = EXCLUDED.confidence,
  score = EXCLUDED.score,
  revision = current.revision + 1,
  updated_at = now();