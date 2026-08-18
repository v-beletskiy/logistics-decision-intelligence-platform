/* @name UpdateDepot */
UPDATE operational_workspace.depots
SET name = :name!,
    country = :country!,
    state_or_region = :stateOrRegion,
    city = :city!,
    street = :street!,
    building_number = :buildingNumber!,
    postal_code = :postalCode!,
    latitude = :latitude!,
    longitude = :longitude!,
    status = :status!,
    vehicle_capacity = :vehicleCapacity!,
    driver_capacity = :driverCapacity!,
    vehicle_count = :vehicleCount!,
    driver_count = :driverCount!,
    revision = revision + 1,
    updated_at = now()
WHERE tenant_id = :tenantId!
  AND id = :id!
  AND revision = :expectedRevision!
RETURNING revision;
