/* @name FindVehicleById */
SELECT
  v.id,
  v.registration_number,
  v.name,
  v.depot_id,
  v.status,
  COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', c.id,
        'type', c.type,
        'name', c.name,
        'max_weight', c.max_weight,
        'max_weight_unit', c.max_weight_unit,
        'max_length', c.max_length,
        'max_width', c.max_width,
        'max_height', c.max_height,
        'dimension_unit', c.dimension_unit,
        'max_volume', c.max_volume,
        'max_volume_unit', c.max_volume_unit
      )
      ORDER BY c.id
    ) FILTER (WHERE c.id IS NOT NULL),
    '[]'::jsonb
  ) AS compartments
FROM operational_workspace.vehicles v
LEFT JOIN operational_workspace.vehicle_compartments c ON c.vehicle_id = v.id
WHERE v.id = :id!
GROUP BY v.id;
