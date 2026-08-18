/* @name InsertShipment */
INSERT INTO operational_workspace.shipments
  (tenant_id, id, status, pickup_completed, delivery_completed,
   pickup_country, pickup_state_or_region, pickup_city, pickup_street, pickup_building_number, pickup_postal_code,
   pickup_latitude, pickup_longitude, pickup_start_at, pickup_end_at,
   delivery_country, delivery_state_or_region, delivery_city, delivery_street, delivery_building_number, delivery_postal_code,
   delivery_latitude, delivery_longitude, delivery_start_at, delivery_end_at,
   weight_value, weight_unit, length, width, height, dimension_unit)
VALUES
  (:tenantId!, :id!, :status!, :pickupCompleted!, :deliveryCompleted!,
   :pickupCountry!, :pickupStateOrRegion, :pickupCity!, :pickupStreet!, :pickupBuildingNumber!, :pickupPostalCode!,
   :pickupLatitude!, :pickupLongitude!, :pickupStartAt!, :pickupEndAt!,
   :deliveryCountry!, :deliveryStateOrRegion, :deliveryCity!, :deliveryStreet!, :deliveryBuildingNumber!, :deliveryPostalCode!,
   :deliveryLatitude!, :deliveryLongitude!, :deliveryStartAt!, :deliveryEndAt!,
   :weightValue!, :weightUnit!, :length!, :width!, :height!, :dimensionUnit!);
