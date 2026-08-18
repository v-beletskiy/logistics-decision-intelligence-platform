/* @name SaveRecommendation */
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
VALUES (
  :tenantId!,
  :id!,
  :routeId!,
  :optimizationId!,
  :type!,
  :status!,
  :summary,
  :confidence,
  :score!,
  1
)
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