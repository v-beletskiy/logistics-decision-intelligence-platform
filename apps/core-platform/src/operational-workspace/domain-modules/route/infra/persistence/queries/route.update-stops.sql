/* @name UpdateRouteStops
   @param rows -> ((id, shipmentId, operationType, status, executionSequence, arrivalTime, departureTime)...) */
WITH updated_stops(id, shipment_id, operation_type, status, execution_sequence, arrival_time, departure_time) AS (
  VALUES :rows
)
UPDATE operational_workspace.route_stops AS s
SET shipment_id = u.shipment_id::uuid,
    operation_type = u.operation_type::text,
    status = u.status::text,
    execution_sequence = u.execution_sequence::integer,
    arrival_time = u.arrival_time::timestamptz,
    departure_time = u.departure_time::timestamptz
FROM updated_stops AS u
WHERE s.id = u.id::uuid;
