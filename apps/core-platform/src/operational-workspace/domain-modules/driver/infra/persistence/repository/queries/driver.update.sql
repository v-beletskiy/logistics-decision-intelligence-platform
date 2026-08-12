/* @name UpdateDriver */
UPDATE operational_workspace.drivers
SET first_name = :firstName!,
    last_name = :lastName!,
    license_number = :licenseNumber!,
    depot_id = :depotId,
    phone_number = :phoneNumber,
    status = :status!,
    revision = revision + 1,
    updated_at = now()
WHERE tenant_id = :tenantId!
  AND id = :id!
  AND revision = :expectedRevision!
RETURNING revision;
