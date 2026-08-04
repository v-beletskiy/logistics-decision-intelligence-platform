/* @name UpdateVehicleCompartments
   @param rows -> ((id, type, name, maxWeight, maxWeightUnit, maxLength, maxWidth, maxHeight, dimensionUnit, maxVolume, maxVolumeUnit)...) */
WITH updated_compartments(id, type, name, max_weight, max_weight_unit, max_length, max_width, max_height, dimension_unit, max_volume, max_volume_unit) AS (
  VALUES :rows
)
UPDATE operational_workspace.vehicle_compartments AS c
SET type = u.type::text,
    name = u.name::text,
    max_weight = u.max_weight::double precision,
    max_weight_unit = u.max_weight_unit::text,
    max_length = u.max_length::double precision,
    max_width = u.max_width::double precision,
    max_height = u.max_height::double precision,
    dimension_unit = u.dimension_unit::text,
    max_volume = u.max_volume::double precision,
    max_volume_unit = u.max_volume_unit::text
FROM updated_compartments AS u
WHERE c.id = u.id::uuid;
