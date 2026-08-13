/* @name DeleteVehicleCompartments
   @param ids -> (...) */
DELETE FROM operational_workspace.vehicle_compartments
WHERE tenant_id = :tenantId!
  AND vehicle_id = :ownerId!
  AND id IN :ids;
