/* @name InsertDepot */
INSERT INTO operational_workspace.depots
  (tenant_id, id, name, country, state_or_region, city, street, building_number, postal_code, latitude, longitude, status, vehicle_capacity, driver_capacity, vehicle_count, driver_count)
VALUES (:tenantId!, :id!, :name!, :country!, :stateOrRegion, :city!, :street!, :buildingNumber!, :postalCode!, :latitude!, :longitude!, :status!, :vehicleCapacity!, :driverCapacity!, :vehicleCount!, :driverCount!);
