/* @name FindAvailableDrivers */
SELECT id, first_name, last_name, license_number, depot_id, phone_number, status
FROM operational_workspace.drivers
WHERE status = :status!
ORDER BY last_name, first_name;
