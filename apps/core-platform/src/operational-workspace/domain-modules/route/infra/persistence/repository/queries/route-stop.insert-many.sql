/* @name InsertRouteStops
   @param rows -> ((tenantId, id, routeId, shipmentId, sequence, operationType, status, plannedArrivalAt, plannedDepartureAt, actualArrivalAt, actualDepartureAt)...) */
INSERT INTO operational_workspace.route_stops (
  tenant_id,
  id,
  route_id,
  shipment_id,
  sequence,
  operation_type,
  status,
  planned_arrival_at,
  planned_departure_at,
  actual_arrival_at,
  actual_departure_at
)
VALUES :rows;
