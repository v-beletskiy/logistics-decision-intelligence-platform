/*  @name InsertRouteStops
    @param rows -> ((id, routeId, shipmentId, operationType, status, executionSequence, arrivalTime, departureTime)...) */
INSERT INTO operational_workspace.route_stops
  (id, route_id, shipment_id, operation_type, status, execution_sequence, arrival_time, departure_time)
VALUES :rows;
