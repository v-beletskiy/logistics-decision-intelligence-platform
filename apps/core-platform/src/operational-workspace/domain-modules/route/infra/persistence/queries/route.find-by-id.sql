/* @name FindRouteById */
SELECT
  r.id,
  r.status,
  COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', s.id,
        'shipmentId', s.shipment_id,
        'operationType', s.operation_type,
        'status', s.status,
        'arrivalTime', s.arrival_time,
        'departureTime', s.departure_time
      )
      ORDER BY s.execution_sequence
    ) FILTER (WHERE s.id IS NOT NULL),
    '[]'::jsonb
  ) AS stops
FROM operational_workspace.routes r
LEFT JOIN operational_workspace.route_stops s ON s.route_id = r.id
WHERE r.id = :id!
GROUP BY r.id;
