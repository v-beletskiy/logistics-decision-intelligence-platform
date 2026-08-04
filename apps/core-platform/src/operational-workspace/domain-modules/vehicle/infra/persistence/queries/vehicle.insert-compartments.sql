/*  @name InsertVehicleCompartments
    @param rows -> ((id, vehicleId, type, name, maxWeight, maxWeightUnit, maxLength, maxWidth, maxHeight, dimensionUnit, maxVolume, maxVolumeUnit)...) */
INSERT INTO operational_workspace.vehicle_compartments
  (id, vehicle_id, type, name, max_weight, max_weight_unit, max_length, max_width, max_height,
   dimension_unit, max_volume, max_volume_unit)
VALUES :rows;
