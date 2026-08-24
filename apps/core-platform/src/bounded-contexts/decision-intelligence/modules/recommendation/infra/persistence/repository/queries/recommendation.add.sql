/* @name AddRecommendation */
INSERT INTO decision_intelligence.recommendations (
  tenant_id,
  id,
  route_id,
  optimization_id,
  type,
  status,
  analysis_request_event_id,
  analysis_status,
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
  :analysisRequestEventId,
  :analysisStatus!,
  :summary,
  :confidence,
  :score!,
  1
);
