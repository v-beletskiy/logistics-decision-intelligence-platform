/* @name UpdateOptimization */
UPDATE decision_intelligence.optimizations
SET route_id = :routeId!,
    status = :status!,
    input_version = :inputVersion,
    revision = revision + 1,
    updated_at = now()
WHERE tenant_id = :tenantId!
  AND id = :id!
  AND revision = :expectedRevision!
RETURNING revision;