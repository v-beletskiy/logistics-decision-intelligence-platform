/* @name DeleteDepot */
DELETE FROM operational_workspace.depots
WHERE tenant_id = :tenantId!
  AND id = :id!;
