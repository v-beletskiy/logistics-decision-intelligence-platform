/* @name InsertVehicle */
INSERT INTO operational_workspace.vehicles (tenant_id, id, registration_number, name, depot_id, status)
VALUES (:tenantId!, :id!, :registrationNumber!, :name, :depotId, :status!);
