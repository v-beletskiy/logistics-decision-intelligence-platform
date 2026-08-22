/* @name UpdateVehicle */
UPDATE operational_workspace.vehicles
SET registration_number = :registrationNumber!,
    name = :name,
    depot_id = :depotId,
    status = :status!,
    revision = revision + 1,
    updated_at = now()
WHERE tenant_id = :tenantId!
  AND id = :id!
  AND revision = :expectedRevision!
RETURNING revision;
