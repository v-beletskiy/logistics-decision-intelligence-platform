/* @name UpdateShipment */
UPDATE operational_workspace.shipments
SET status = :status!,
    pickup_completed = :pickupCompleted!,
    delivery_completed = :deliveryCompleted!,
    pickup_country = :pickupCountry!,
    pickup_state_or_region = :pickupStateOrRegion,
    pickup_city = :pickupCity!,
    pickup_street = :pickupStreet!,
    pickup_building_number = :pickupBuildingNumber!,
    pickup_postal_code = :pickupPostalCode!,
    pickup_latitude = :pickupLatitude!,
    pickup_longitude = :pickupLongitude!,
    pickup_start_at = :pickupStartAt!,
    pickup_end_at = :pickupEndAt!,
    delivery_country = :deliveryCountry!,
    delivery_state_or_region = :deliveryStateOrRegion,
    delivery_city = :deliveryCity!,
    delivery_street = :deliveryStreet!,
    delivery_building_number = :deliveryBuildingNumber!,
    delivery_postal_code = :deliveryPostalCode!,
    delivery_latitude = :deliveryLatitude!,
    delivery_longitude = :deliveryLongitude!,
    delivery_start_at = :deliveryStartAt!,
    delivery_end_at = :deliveryEndAt!,
    weight_value = :weightValue!,
    weight_unit = :weightUnit!,
    length = :length!,
    width = :width!,
    height = :height!,
    dimension_unit = :dimensionUnit!,
    revision = revision + 1,
    updated_at = now()
WHERE tenant_id = :tenantId!
  AND id = :id!
  AND revision = :expectedRevision!
RETURNING revision;
