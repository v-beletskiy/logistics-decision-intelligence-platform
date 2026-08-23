/* @name AddRecommendation */
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
);
