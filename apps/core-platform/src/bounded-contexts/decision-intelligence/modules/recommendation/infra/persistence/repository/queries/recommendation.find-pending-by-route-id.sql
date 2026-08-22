/* @name FindRecommendationsPendingByRouteId */
SELECT
  r.id,
  r.route_id,
  r.optimization_id,
  r.type,
  r.status,
  r.summary,
  r.confidence,
  r.score,
  r.revision,
  COALESCE(facts.items, '[]'::jsonb) AS facts,
  COALESCE(findings.items, '[]'::jsonb) AS findings
FROM decision_intelligence.recommendations r
LEFT JOIN LATERAL (
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', f.id,
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
      'id', g.id,
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
WHERE r.tenant_id = :tenantId!
  AND r.route_id = :routeId!
  AND r.status = 'PENDING'
ORDER BY r.id;