/* @name ReconcileVehicleCompartments */
WITH incoming AS (
  SELECT *
  FROM unnest(
    :ids!::uuid[],
    :types!::text[],
    :names!::text[],
    :maxWeights!::double precision[],
    :maxWeightUnits!::text[],
    :maxLengths!::double precision[],
    :maxWidths!::double precision[],
    :maxHeights!::double precision[],
    :dimensionUnits!::text[],
    :maxVolumes!::double precision[],
    :maxVolumeUnits!::text[]
  ) AS values(id, type, name, max_weight, max_weight_unit, max_length, max_width, max_height, dimension_unit, max_volume, max_volume_unit)
),
upserted AS (
  INSERT INTO operational_workspace.vehicle_compartments AS current (
    tenant_id, vehicle_id, id, type, name, max_weight, max_weight_unit,
    max_length, max_width, max_height, dimension_unit, max_volume, max_volume_unit
  )
  SELECT
    :tenantId!, :vehicleId!, incoming.id, incoming.type,
    NULLIF(incoming.name, ''),
    incoming.max_weight, incoming.max_weight_unit, incoming.max_length,
    incoming.max_width, incoming.max_height, incoming.dimension_unit,
    incoming.max_volume, incoming.max_volume_unit
  FROM incoming
  ON CONFLICT (tenant_id, vehicle_id, id) DO UPDATE SET
    type = EXCLUDED.type,
    name = EXCLUDED.name,
    max_weight = EXCLUDED.max_weight,
    max_weight_unit = EXCLUDED.max_weight_unit,
    max_length = EXCLUDED.max_length,
    max_width = EXCLUDED.max_width,
    max_height = EXCLUDED.max_height,
    dimension_unit = EXCLUDED.dimension_unit,
    max_volume = EXCLUDED.max_volume,
    max_volume_unit = EXCLUDED.max_volume_unit
  WHERE (
    current.type, current.name, current.max_weight, current.max_weight_unit,
    current.max_length, current.max_width, current.max_height,
    current.dimension_unit, current.max_volume, current.max_volume_unit
  ) IS DISTINCT FROM (
    EXCLUDED.type, EXCLUDED.name, EXCLUDED.max_weight, EXCLUDED.max_weight_unit,
    EXCLUDED.max_length, EXCLUDED.max_width, EXCLUDED.max_height,
    EXCLUDED.dimension_unit, EXCLUDED.max_volume, EXCLUDED.max_volume_unit
  )
  RETURNING id
),
deleted AS (
  DELETE FROM operational_workspace.vehicle_compartments current
  WHERE current.tenant_id = :tenantId!
    AND current.vehicle_id = :vehicleId!
    AND current.id <> ALL(:ids!::uuid[])
  RETURNING id
)
SELECT
  (SELECT count(*)::integer FROM upserted) AS "upsertedCount!",
  (SELECT count(*)::integer FROM deleted) AS "deletedCount!";
