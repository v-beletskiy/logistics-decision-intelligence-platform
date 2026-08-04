/* @name InsertDriver */
INSERT INTO operational_workspace.drivers
  (id, first_name, last_name, license_number, depot_id, phone_number, status)
VALUES (:id!, :firstName!, :lastName!, :licenseNumber!, :depotId, :phoneNumber, :status!);
