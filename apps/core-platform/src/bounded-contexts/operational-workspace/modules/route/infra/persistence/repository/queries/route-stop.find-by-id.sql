/* @name FindRouteStopById */
SELECT
  s.id,
  s.route_id,
  s.shipment_id,
  s.sequence,
  s.operation_type,
  s.status,
  s.planned_arrival_at,
  s.planned_departure_at,
  s.actual_arrival_at,
  s.actual_departure_at,
  s.revision
FROM operational_workspace.route_stops s
WHERE s.tenant_id = :tenantId!
  AND s.id = :id!;
