/* @name DeleteVehicleCompartments
   @param ids -> (...) */
DELETE FROM operational_workspace.vehicle_compartments
WHERE id IN :ids;
