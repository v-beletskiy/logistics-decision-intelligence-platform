/* @name DeleteAssignment */
DELETE FROM operational_workspace.assignments
WHERE tenant_id = :tenantId!
  AND id = :id!;
