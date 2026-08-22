/* @name InsertDriver */
INSERT INTO operational_workspace.drivers
  (tenant_id, id, first_name, last_name, license_number, depot_id, phone_number,
   status, revision)
VALUES
  (:tenantId!, :id!, :firstName!, :lastName!, :licenseNumber!, :depotId,
   :phoneNumber, :status!, 1);
