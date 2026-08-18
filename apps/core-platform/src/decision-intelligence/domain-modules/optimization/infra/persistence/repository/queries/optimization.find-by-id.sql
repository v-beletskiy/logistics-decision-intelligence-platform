/* @name FindOptimizationById */
SELECT
  id,
  route_id,
  status,
  input_version,
  revision
FROM decision_intelligence.optimizations
WHERE tenant_id = :tenantId!
  AND id = :id!;