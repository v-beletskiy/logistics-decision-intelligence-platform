/* @name InsertDepot */
INSERT INTO operational_workspace.depots
  (id, name, country, state_or_region, city, street, building_number, postal_code, status, vehicle_capacity, driver_capacity, vehicle_count, driver_count)
VALUES (:id!, :name!, :country!, :stateOrRegion, :city!, :street!, :buildingNumber!, :postalCode!, :status!, :vehicleCapacity!, :driverCapacity!, :vehicleCount!, :driverCount!);
