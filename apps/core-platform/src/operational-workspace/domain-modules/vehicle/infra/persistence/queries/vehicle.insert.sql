/* @name InsertVehicle */
INSERT INTO operational_workspace.vehicles (id, registration_number, name, depot_id, status)
VALUES (:id!, :registrationNumber!, :name, :depotId, :status!);
