/* @name FindDriverById */
SELECT id, first_name, last_name, license_number, depot_id, phone_number, status
FROM operational_workspace.drivers
WHERE id = :id!;
