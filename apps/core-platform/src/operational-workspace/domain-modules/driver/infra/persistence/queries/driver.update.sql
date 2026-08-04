/* @name UpdateDriver */
UPDATE operational_workspace.drivers
SET first_name = :firstName!,
    last_name = :lastName!,
    license_number = :licenseNumber!,
    depot_id = :depotId,
    phone_number = :phoneNumber,
    status = :status!,
    updated_at = now()
WHERE id = :id!;
