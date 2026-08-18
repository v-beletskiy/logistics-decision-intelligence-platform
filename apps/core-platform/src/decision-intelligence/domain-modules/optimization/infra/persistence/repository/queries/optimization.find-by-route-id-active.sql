/* @name FindOptimizationByRouteIdActive */
SELECT
  id,
  route_id,
  status,
  input_version,
  revision
FROM decision_intelligence.optimizations
WHERE tenant_id = :tenantId!
  AND route_id = :routeId!
  AND status IN ('QUEUED', 'RUNNING')
LIMIT 1;