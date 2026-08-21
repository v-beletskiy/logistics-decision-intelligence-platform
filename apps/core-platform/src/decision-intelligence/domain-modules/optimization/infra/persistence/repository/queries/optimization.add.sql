/* @name AddOptimization */
INSERT INTO decision_intelligence.optimizations (
  tenant_id,
  id,
  route_id,
  status,
  input_version,
  revision
)
VALUES (
  :tenantId!,
  :id!,
  :routeId!,
  :status!,
  :inputVersion,
  1
)
ON CONFLICT (tenant_id, route_id)
WHERE status IN ('QUEUED', 'RUNNING')
DO NOTHING
RETURNING id;