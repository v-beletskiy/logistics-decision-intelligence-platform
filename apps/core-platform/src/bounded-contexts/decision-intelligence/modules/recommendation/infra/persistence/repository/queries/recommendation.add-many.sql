/* @name AddRecommendations */
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
INSERT INTO decision_intelligence.recommendations (
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
FROM incoming;
