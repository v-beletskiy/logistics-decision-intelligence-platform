/* @name DeleteShipment */
DELETE FROM operational_workspace.shipments
WHERE tenant_id = :tenantId!
  AND id = :id!;
