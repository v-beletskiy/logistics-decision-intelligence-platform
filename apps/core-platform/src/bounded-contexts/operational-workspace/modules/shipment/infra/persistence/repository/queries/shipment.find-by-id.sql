/* @name FindShipmentById */
SELECT id, status, pickup_completed, delivery_completed, revision,
       pickup_country, pickup_state_or_region, pickup_city, pickup_street, pickup_building_number, pickup_postal_code,
       pickup_latitude, pickup_longitude, pickup_start_at, pickup_end_at,
       delivery_country, delivery_state_or_region, delivery_city, delivery_street, delivery_building_number, delivery_postal_code,
       delivery_latitude, delivery_longitude, delivery_start_at, delivery_end_at,
       weight_value, weight_unit, length, width, height, dimension_unit
FROM operational_workspace.shipments
WHERE tenant_id = :tenantId!
  AND id = :id!;
