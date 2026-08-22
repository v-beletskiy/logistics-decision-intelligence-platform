/* @name FindAssignmentById */
SELECT
  a.id,
  a.route_id,
  a.vehicle_id,
  a.driver_id,
  a.status,
  a.revision,
  a.assigned_at,
  a.started_at,
  a.completed_at,
  a.cancelled_at,
  COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', s.id,
        'shipmentId', s.shipment_id,
        'weight', s.weight,
        'weightUnit', s.weight_unit,
        'length', s.length,
        'width', s.width,
        'height', s.height,
        'dimensionUnit', s.dimension_unit
      )
      ORDER BY s.shipment_id
    ) FILTER (WHERE s.id IS NOT NULL),
    '[]'::jsonb
  ) AS shipments
FROM operational_workspace.assignments a
LEFT JOIN operational_workspace.assignment_shipments s
  ON s.tenant_id = a.tenant_id
 AND s.assignment_id = a.id
WHERE a.tenant_id = :tenantId!
  AND a.id = :id!
GROUP BY a.id, a.revision;
