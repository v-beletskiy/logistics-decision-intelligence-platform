/* @name FindRouteStopByRouteIdAndSequenceForUpdate */
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
  AND s.route_id = :routeId!
  AND s.sequence = :sequence!
FOR UPDATE;
