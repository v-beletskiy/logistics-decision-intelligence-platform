/* @name DeleteOptimization */
DELETE FROM decision_intelligence.optimizations
WHERE tenant_id = :tenantId!
  AND id = :id!;