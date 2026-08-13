/* @name UpdateVehicle */
UPDATE operational_workspace.vehicles
SET registration_number = :registrationNumber!,
    name = :name,
    depot_id = :depotId,
    status = :status!,
    updated_at = now()
WHERE tenant_id = :tenantId!
  AND id = :id!;
