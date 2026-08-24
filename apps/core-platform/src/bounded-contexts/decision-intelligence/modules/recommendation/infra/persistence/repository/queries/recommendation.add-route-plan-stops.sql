/* @name AddRecommendationRoutePlanStops */
INSERT INTO decision_intelligence.recommendation_route_plan_stops (
  tenant_id,
  recommendation_id,
  route_stop_id,
  sequence
)
SELECT
  :tenantId!,
  incoming.recommendation_id,
  incoming.route_stop_id,
  incoming.sequence
FROM unnest(
  :recommendationIds!::uuid[],
  :routeStopIds!::uuid[],
  :sequences!::int4[]
) AS incoming(recommendation_id, route_stop_id, sequence)
ON CONFLICT (tenant_id, recommendation_id, route_stop_id) DO NOTHING;
