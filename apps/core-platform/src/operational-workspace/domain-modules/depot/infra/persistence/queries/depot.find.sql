/* @name FindDepots */
SELECT id, name, country, state_or_region, city, street, building_number, postal_code, status, vehicle_capacity, driver_capacity, vehicle_count, driver_count
FROM operational_workspace.depots
ORDER BY name;
