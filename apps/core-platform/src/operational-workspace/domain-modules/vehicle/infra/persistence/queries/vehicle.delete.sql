/* @name DeleteVehicle */
DELETE FROM operational_workspace.vehicles
WHERE tenant_id = :tenantId!
  AND id = :id!;
