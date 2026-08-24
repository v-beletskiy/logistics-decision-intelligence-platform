/* @name ListRecommendationsByRouteId */
SELECT
  r.id,
  r.optimization_id,
  r.type,
  r.status,
  r.score,
  r.analysis_status,
  r.summary,
  r.confidence,
  COALESCE(facts.items, '[]'::jsonb) AS facts,
  COALESCE(findings.items, '[]'::jsonb) AS findings,
  COALESCE(route_plan_stops.items, '[]'::jsonb) AS proposed_route_stop_ids
FROM decision_intelligence.recommendations r
LEFT JOIN LATERAL (
  SELECT jsonb_agg(
    jsonb_build_object(
      'metric', f.metric,
      'baselineValue', f.baseline_value,
      'recommendedValue', f.recommended_value,
      'unit', f.unit,
      'improvement', f.improvement
    )
    ORDER BY f.id
  ) AS items
  FROM decision_intelligence.recommendation_facts f
  WHERE f.tenant_id = r.tenant_id
    AND f.recommendation_id = r.id
) facts ON true
LEFT JOIN LATERAL (
  SELECT jsonb_agg(
    jsonb_build_object(
      'category', g.category,
      'title', g.title,
      'description', g.description
    )
    ORDER BY g.id
  ) AS items
  FROM decision_intelligence.recommendation_findings g
  WHERE g.tenant_id = r.tenant_id
    AND g.recommendation_id = r.id
) findings ON true
LEFT JOIN LATERAL (
  SELECT jsonb_agg(p.route_stop_id ORDER BY p.sequence) AS items
  FROM decision_intelligence.recommendation_route_plan_stops p
  WHERE p.tenant_id = r.tenant_id
    AND p.recommendation_id = r.id
) route_plan_stops ON true
WHERE r.tenant_id = :tenantId!
  AND r.route_id = :routeId!
ORDER BY r.id;
