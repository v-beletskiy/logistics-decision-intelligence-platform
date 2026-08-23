/* @name FindRouteAnalysisContextByRouteId */
SELECT
  r.id AS route_id,
  r.revision AS route_revision,
  s.shipment_id,
  s.planned_arrival_at,
  s.planned_departure_at,
  CASE s.operation_type
    WHEN 'PICKUP' THEN shipment.pickup_latitude
    WHEN 'DELIVERY' THEN shipment.delivery_latitude
  END AS latitude,
  CASE s.operation_type
    WHEN 'PICKUP' THEN shipment.pickup_longitude
    WHEN 'DELIVERY' THEN shipment.delivery_longitude
  END AS longitude
FROM operational_workspace.routes r
LEFT JOIN operational_workspace.route_stops s
  ON s.tenant_id = r.tenant_id
  AND s.route_id = r.id
LEFT JOIN operational_workspace.shipments shipment
  ON shipment.tenant_id = s.tenant_id
  AND shipment.id = s.shipment_id
WHERE r.tenant_id = :tenantId!
  AND r.id = :routeId!
ORDER BY s.sequence;
