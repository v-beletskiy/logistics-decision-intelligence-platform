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
);
